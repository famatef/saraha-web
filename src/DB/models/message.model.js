import mongoose from "mongoose";
const messageSchema = new mongoose.Schema({
  content: { type: String, trim: true, maxlength: 1000, default: "" },
  attachments: { type: [String], default: [] },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }
}, { timestamps: true, strict: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
export default mongoose.models.message || mongoose.model("message", messageSchema);
