import userModel from "../../DB/models/user.model.js";
import revokeTokenModel from "../../DB/models/revokeToken.model.js";
import * as dbservice from "../../DB/service/db.service.js";
import { Encrypt, Decrypt } from "../../common/security/encrypt.js";
import { hash, compare } from "../../common/security/hash.js";
import jwt from "jsonwebtoken";
import {OAuth2Client} from'google-auth-library';
import { ProviderEnum } from "../../common/enum/user.enum.js";
import { randomUUID } from "crypto";
import sendEmail from "../../common/service/sendEmail.js";
import {generate_otp} from "../../common/service/sendEmail.js";
import { eventEmitter } from "../../common/utils/events.js";
import { keys, delKey, setValue, getValue } from "../../DB/service/redis.service.js";
import { ttl } from "../../DB/service/redis.service.js";
import { incr } from "../../DB/service/redis.service.js";
import emailTemplate from "../../common/utils/email.templete.js";
import { sendEmailOtp } from "./user.helper.js";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../../../config/config.service.js";



const client = new OAuth2Client();
    

export const signup = async (req, res, next) => {
  const { fname, lname, email, age, gender, phone, password } = req.body;
  const normalizedEmail = email.toLowerCase();
  if (await userModel.findOne({ email: normalizedEmail })) return res.status(409).json({ message: "email already exists" });
  const profileFile = req.files?.attachment?.[0];
  const coverFiles = req.files?.attachments || [];
  const otp = await generate_otp();
  const otpHash = await hash(otp, 12);
  await setValue({ key: `otp::${normalizedEmail}`, value: otpHash, ttl: 60 * 5 });
  await setValue({ key: `otp::max::${normalizedEmail}`, value: 1, ttl: 60 * 5 });
  await dbservice.create({ model: userModel, data: {
    fname, lname, email: normalizedEmail, age, gender, phone: Encrypt(phone),
    password: await hash(password), profileImage: profileFile?.path,
    coverImages: coverFiles.map(file => file.path)
  }});
  try { await sendEmail({ to: normalizedEmail, subject: "Confirm your email", html: emailTemplate(otp) }); }
  catch (error) { console.error("OTP email could not be sent:", error.message); }
  return res.status(201).json({ message: "Account created. Check your email for the verification code." });
};

export const signupGmail = async (req, res,next) => {
    const { idToken } = req.body;
    
    
      const decoded = await client.verifyIdToken({
        idToken,
        audience: "272786427705-fhkjaja9u9gcr870d7betnl55ir8ru29.apps.googleusercontent.com"

  });
         const { email, given_name, family_name, picture, email_verified } = decoded.getPayload();
     let user = await userModel.findOne({ email: email.toLowerCase() });
     if (!user) {
        user =await userModel.create({

            fname: given_name,
            lname: family_name,
            email,
            profileImage: picture,
            isConfirmed:email_verified,
            provider: ProviderEnum.google
        });
    }
    if(user.provider === ProviderEnum.system){
        throw new Error("login with system account first");
    }
    const access_token = jwt.sign({ userId: user._id, email: user.email }, ACCESS_TOKEN_SECRET, {
        expiresIn: 60 * 5,
       
    });

    const refresh_token = jwt.sign({ userId: user._id, email: user.email }, REFRESH_TOKEN_SECRET);

    return res.status(200).json({
        message: "success",
        access_token,
        refresh_token
        
    });
    
};

    


    


export const signin = async (req, res,next) => {
    const { email, password } = req.body;
    const user = await dbservice.findOne({
        model: userModel,
        filter: { email: email.toLowerCase(), provider: "system" }
    });


    if (!user) {
        throw new Error("email not found");
    }

    if (!(await compare(password, user.password))) {
        throw new Error("invalid password");
    }
    const tokenId =randomUUID();

    const access_token = jwt.sign({ userId: user._id, email: user.email }, ACCESS_TOKEN_SECRET, {
        expiresIn: 60 * 5,
        jwtid: tokenId,
        audience: "http://localhost:4000",
        issuer: "http://localhost:3000",
    });


    const refresh_token = jwt.sign({ userId: user._id, email: user.email }, REFRESH_TOKEN_SECRET,{
        jwtid: tokenId
    })

    return res.status(200).json({
        message: "success",
        user: { _id: user._id, fname: user.fname, lname: user.lname, email: user.email, age: user.age, gender: user.gender, phone: Decrypt(user.phone), profileImage: user.profileImage, isConfirmed: user.isConfirmed },
        access_token,
        refresh_token,
    });
    
};

export const getprofile = async (req, res,next) => {

    if (!req.user) {
        throw new Error("user not found", { cause: 401 });
    }

    return res.status(200).json({
        message: "success",
        user: { _id: req.user._id, fname: req.user.fname, lname: req.user.lname, email: req.user.email, age: req.user.age, gender: req.user.gender, profileImage: req.user.profileImage, isConfirmed: req.user.isConfirmed },
    });
};
export const refreshToken = async (req, res,next) => {
    const{authorization} = req.headers;
    if (!authorization) {
        throw new Error("authorization token not found");
      }
      let decoded;
      try {
          decoded = jwt.verify(authorization, REFRESH_TOKEN_SECRET);
      } catch {
          throw new Error("refresh token is invalid or expired", { cause: 401 });
      }
      if (!decoded?.userId) {
        throw new Error("user not found");
      }
      const user =await dbservice.findOne({
        model: userModel,
        filter: { _id: decoded.userId }
      });
      if (!user) {
        throw new Error("user not found");
      }
      const access_token = jwt.sign({ userId: user._id, email: user.email }, ACCESS_TOKEN_SECRET, {
          expiresIn: 60 * 5,
      });
      return res.status(200).json({
          message: "success",
          access_token,
      });
  };
  export const shareProfile = async (req, res,next) => {
      const { id } = req.params;
      const user = await dbservice.findById({
          model: userModel,
          id,
          options:{password:0}
      })
      if (!user) {
          throw new Error("user not found");
      }
      user.phone = Decrypt(user.phone);
      return res.status(200).json({
          message: "success",
          user,
      });
  };
  export const updateProfile = async (req, res,next) => {
      const { fname, lname, phone, gender, age } = req.body;
      let updateQuery = {};
      if (fname !== undefined){
          updateQuery.fname = fname;
      }
      if (lname !== undefined){
          updateQuery.lname = lname;
      }
      if (phone !== undefined){
          updateQuery.phone = Encrypt(phone);
      }
      if (gender !== undefined){
          updateQuery.gender = gender;
      }
      if (age !== undefined){
          updateQuery.age = age;
      }
      let user = await dbservice.findByIdAndUpdate({
          model: userModel,
          id: req.user._id,
          update: updateQuery,
      });
      if (!user) {
          throw new Error("user not found", { cause: 404 });
      }
      user.phone = Decrypt(user.phone);
      return res.status(200).json({
          message: "success",
          user,
      });
  };
  export const updatePassword = async (req, res,next) => {
      const { oldPassword, newPassword } = req.body;
      if(!await compare(oldPassword, req.user.password)){
          throw new Error("old password is incorrect");
      }
req.user.password = await hash(newPassword);
      req.user.changeCredentialAt = new Date();
      await req.user.save();
      return res.status(200).json({
          message: "success",
          user:req.user,
      });
    };
    export const logout = async (req, res,next) => {
        const {flag} = req.query;
        if(flag === "all"){
            req.user.changeCredentialAt = new Date();
            await req.user.save()
            await delKey(await keys(`revokeToken::${req.user._id}`))
        }
        else{
            await setValue({
                key:`revokeToken::${req.user._id}::${req.decoded.jti}`,
                value:`${req.decoded.jti}`,
                ttl: req.decoded.exp - Math.floor(Date.now()/1000)
            }

            )
            
        }
        return res.status(200).json({ message: "logged out successfully" });
    };
      
    export const confirmEmail = async (req, res,next) => {
        const { email, otp } = req.body;
        const otpValue = await getValue(`otp::${email}`);
        if (!otpValue) {
            throw new Error("otp expired");
        }
        if (!(await compare(otp, otpValue))) {
            throw new Error("otp is invalid");
        }
        const user = await dbservice.findOneAndUpdate({
            model: userModel,
            filter:{
                email: email.toLowerCase(),
                isConfirmed: false

            },
            update:{
                isConfirmed:true
            }
        })
        if (!user) {
            throw new Error("user not found");
        }
        await delKey(`otp::${email}`)
        return res.status(200).json({
            message: "success",
            user,
        });
    };
    export const reSendOtp = async (req,res,next) =>{
        const { email } = req.body;
        await sendEmailOtp({ email });
        return res.status(200).json({
            message: "success"
            
        })
        
        
    }
    export const forgotPassword = async (req, res,next) => {
        const { email } = req.body;
        await sendEmailOtp({email,isConfirmed:true})
        return res.status(200).json({
            message: "success"
            
        })
    }
   export const resetPassword = async (req, res,next) => {
        const { email, otp, newPassword } = req.body;
        const otpValue = await getValue(`otp::${email}`);
        if (!otpValue) {
            throw new Error("otp expired");
        }
        if (!(await compare(otp, otpValue))) {
            throw new Error("otp is invalid");
        }
        await dbservice.findOneAndUpdate({
            model: userModel,
            filter:{
                email,
                isConfirmed:true

            },
            update:{
                password:await hash(newPassword),
                changeCredentialAt: new Date()
            }
        })
        await delKey(`otp::${email}`)
        return res.status(200).json({
            message: "success"
            
        })
    }
