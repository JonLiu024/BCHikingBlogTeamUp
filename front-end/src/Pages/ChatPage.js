import React, { useState } from "react";
import axios from "axios";

const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const fetchChats = async () => {
    const { data } = await axios.get("/api/chat");
    console.log(data);
    setChats(data);
  };
  useState(() => {
    // fetchChats();
  }, []);

  return (
    <div>
      {chats.map((chat) => (
        <div>{chat.name}</div>
      ))}
    </div>
  );
};

export default ChatPage;
