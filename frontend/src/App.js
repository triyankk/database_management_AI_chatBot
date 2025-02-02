import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastCommand, setLastCommand] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessage = (message) => {
    let formattedMessage = message.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
    formattedMessage = formattedMessage.replace(/\*(.*?)\*/g, "<li>$1</li>");
    return formattedMessage;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    const userMessage = { role: "user", content: input };
    setMessages([...messages, userMessage]);

    try {
      console.log("Sending message to backend:", input);
      const response = await axios.post("http://localhost:5000/api/chat", {
        message: input,
      });
      console.log("Received response from backend:", response.data);
      const botMessage = {
        role: "assistant",
        content: formatMessage(response.data.choices[0].message.content),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Error communicating with backend";
      const botMessage = {
        role: "assistant",
        content: `Error: ${errorMessage}`,        
      };
      setMessages((prev) => [...prev, botMessage]);
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }

    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="app-container">
      <div className="chat-container">
        <div className="header">
          <h1>AI Chat Assistant</h1>
        </div>

        <div className="messages-container">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`message ${
                msg.role === "user" ? "user-message" : "ai-message"
              }`}>
              <div
                className="message-content"
                dangerouslySetInnerHTML={{ __html: msg.content }}
              />
            </div>
          ))}
          {isLoading && (
            <div className="message ai-message">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            rows="1"
          />
          <button onClick={sendMessage} disabled={isLoading || !input.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
