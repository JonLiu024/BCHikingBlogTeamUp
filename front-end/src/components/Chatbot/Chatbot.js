import React, { useState } from "react";

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (input) {
      const response = await fetch(
        `https://dialogflow.googleapis.com/v2/projects/YOUR_PROJECT_ID/agent/sessions/{YOUR_SESSION_ID}:detectIntent`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer YOUR_ACCESS_TOKEN`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            queryInput: {
              text: {
                text: input,
                languageCode: "en",
              },
            },
          }),
        }
      );

      const data = await response.json();
      const botResponse = data.queryResult.fulfillmentText;
      setMessages([
        ...messages,
        { user: "You", text: input },
        { user: "Bot", text: botResponse },
      ]);
      setInput("");
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.user}:</strong> {msg.text}
          </p>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatBot;
