import { Mongoose } from "mongoose";
const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, required: true },
    content: { type: String, required: true, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  },
  {
    Timestamp: true,
  }
);

const Message = mongoose.Model("Message", messageSchema);
module.export = Message;
