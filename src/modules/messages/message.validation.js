import Joi from "joi";
export const createMessageSchema = { body: Joi.object({ content: Joi.string().trim().max(1000).allow("").default("") }).required() };
