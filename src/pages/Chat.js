import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faCamera, faMicrophone } from "@fortawesome/free-solid-svg-icons";

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Okay so we’ve got brunch booked but what are we doing after?",
      sender: "other",
      avatar: "https://cdn-icons-png.flaticon.com/512/847/847969.png"
    },
    {
      id: 2,
      text: "How about we leave it blank for now and just explore nearby?",
      sender: "me",
      avatar: "https://cdn-icons-png.flaticon.com/512/847/847969.png"
    },
    {
      id: 3,
      text: "Oh that’s a great idea! I like exploring new cities anyways. Should we be spontaneous or should we have a look at a particular area to explore?",
      sender: "other",
      avatar: "https://cdn-icons-png.flaticon.com/512/847/847969.png"
    },
    {
      id: 4,
      text: "Actually, brunch is near the Carlton Garden, let’s go there to take pictures, and explore the area.",
      sender: "me",
      avatar: "https://cdn-icons-png.flaticon.com/512/847/847969.png"
    },
    {
      id: 5,
      text: "Oh yes! I like that, how about let’s give ourselves time to explore around Carlton, and then maybe we can slowly make our way to the central area to explore?",
      sender: "other",
      avatar: "https://cdn-icons-png.flaticon.com/512/847/847969.png"
    },
    {
      id: 6,
      text: "That sounds great! I’ll put Carlton into the itinerary, and then leave a larger time slot to explore the suburb and also the city!",
      sender: "me",
      avatar: "https://cdn-icons-png.flaticon.com/512/847/847969.png"
    },
    {
      id: 7,
      text: "Yay, sounds good. Thank you!",
      sender: "other",
      avatar: "https://cdn-icons-png.flaticon.com/512/847/847969.png"
    }
  ]);

  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (input.trim() === "") return;
    setMessages([
      ...messages,
      { id: Date.now(), text: input, sender: "me", avatar: "https://cdn-icons-png.flaticon.com/512/847/847969.png" }
    ]);
    setInput("");
  };

  return (
    <div className="chat-page-center">
      <div className="chat-container chat-large">
        <div className="chat-header">Michelle</div>

        <div className="chat-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-row ${msg.sender === "me" ? "me" : "other"}`}
            >
              {msg.sender === "other" && (
                <img src={msg.avatar} alt="avatar" className="chat-avatar" />
              )}
              <div className={`chat-bubble ${msg.sender}`}>{msg.text}</div>
              {msg.sender === "me" && (
                <img src={msg.avatar} alt="avatar" className="chat-avatar" />
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write a message..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <div className="chat-actions">
            {/* Swapped: Picture first, Mic second */}
            <FontAwesomeIcon icon={faCamera} className="chat-icon-btn" />
            <FontAwesomeIcon icon={faMicrophone} className="chat-icon-btn" />
            <button onClick={sendMessage} className="send-btn">
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
