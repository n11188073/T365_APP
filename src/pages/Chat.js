import React, { useState } from "react";

const Chat = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey, how are you?", sender: "other" },
    { id: 2, text: "I'm good thx, hbu?", sender: "me" },
    { id: 1, text: "Good, what are your plans for our trip?", sender: "other" }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (input.trim() === "") return;
    setMessages([...messages, { id: Date.now(), text: input, sender: "me" }]);
    setInput("");
  };

  return (
    <div className="chat-container">
      <div className="chat-header">Chat</div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-bubble ${msg.sender === "me" ? "me" : "other"}`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;