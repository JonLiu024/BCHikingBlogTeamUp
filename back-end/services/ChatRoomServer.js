const express = require("express");
const app = express();
const chat = require("../data/chat-data");
const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT || 3001;

app.get("/", (req, res) => {
  res.send("API is running in the background.");
});

app.get("/api/chat", (req, res) => {
  res.send(chat.chats);
});
app.get("/api/chat/:id", (req, res) => {
  const singleChat = chat.chats.find((c) => c._id === req.params.id);
  res.send(singleChat);
});
app.listen(PORT, console.log(`your server started at port ${PORT}`));
