import * as dbService from "../../DB/service/db.service.js";
import messageModel from "../../DB/models/message.model.js";
export const createMessage = async (req, res, next) => {
  try {
    const content = (req.body.content || "").trim();
    if (!req.params.userId || !/^[a-f0-9]{24}$/i.test(req.params.userId)) return res.status(400).json({ message: "A valid profile ID is required" });
    if (!content && !req.files?.length) return res.status(400).json({ message: "Write a message first" });
    const attachments = (req.files || []).map(file => file.path.replace(/\\/g, "/"));
    const message = await dbService.create({ model: messageModel, data: { content, attachments, userId: req.params.userId } });
    return res.status(201).json({ message: "Message sent successfully", data: message });
  } catch (error) { next(error); }
};
export const getMessage = async (req, res) => {
  const messages = await dbService.find({ model: messageModel, filter: { userId: req.user._id }, options: { sort: { createdAt: -1 } } });
  return res.status(200).json(messages);
};
export const getMessageById = async (req, res) => {
  const message = await dbService.findOne({ model: messageModel, filter: { _id: req.params.id, userId: req.user._id } });
  if (!message) return res.status(404).json({ message: "Message not found" });
  return res.status(200).json(message);
};
