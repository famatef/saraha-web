import nodemailer from 'nodemailer';
import { randomInt } from 'crypto';


export const sendEmail = async ({to, subject, html, attachments} = {}) => {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!user || !pass) {
        throw new Error("SMTP_USER and SMTP_PASS must be configured");
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user,
            pass
        }
    });

    const info = await transporter.sendMail({
        from: user,
        to,
        subject,
        html: html || '<b>Hello World</b>',
        attachments: attachments || []
    });
    return info.accepted.length > 0;
};
export const generate_otp =() =>{
    return randomInt(100000, 1000000).toString();
}
export default sendEmail;
