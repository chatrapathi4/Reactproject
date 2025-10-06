import React, { useState, useEffect, useRef } from 'react';
import '../styles/QuickChat.css';
import { WS_BASE_URL } from '../config';

const QuickChat = ({ roomId, roomType, username, isOpen, onToggle }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isOpen || !roomId || !username) return;

    // Create a unique chat room for each whiteboard/IDE session
    const chatRoomId = `${roomType}_${roomId}_chat`;
    const ws = new WebSocket(`${WS_BASE_URL}/ws/chat/${chatRoomId}/`);
    
    ws.onopen = () => {
      console.log('Connected to quick chat WebSocket');
      setIsConnected(true);
      
      // Auto-join with the provided username
      ws.send(JSON.stringify({
        type: 'join',
        username: username
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'chat') {
        setMessages(prev => [...prev, data.message]);
      } else if (data.type === 'user_list') {
        setUsers(data.users);
      }
    };

    ws.onclose = () => {
      console.log('Quick chat WebSocket connection closed');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('Quick chat WebSocket error:', error);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [isOpen, roomId, roomType, username]);

  const sendMessage = () => {
    if (socket && message.trim() && isConnected) {
      const messageData = {
        username: username,
        text: message.trim(),
        timestamp: new Date().toISOString()
      };

      socket.send(JSON.stringify({
        type: 'chat',
        message: messageData
      }));

      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="quick-chat-overlay">
      <div className="quick-chat-container">
        <div className="quick-chat-header">
          <div className="chat-title">
            <span className="chat-icon">💬</span>
            <h3>Quick Chat</h3>
            <span className="user-count">({users.length})</span>
          </div>
          <button className="close-chat-btn" onClick={onToggle}>
            ✕
          </button>
        </div>

        <div className="quick-chat-users">
          <div className="users-scroll">
            {users.map((user, index) => (
              <span key={index} className="user-badge">
                {user}
              </span>
            ))}
          </div>
        </div>

        <div className="quick-chat-messages">
          {messages.length === 0 ? (
            <div className="no-messages-quick">
              <p>Start a quick conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`quick-message ${msg.username === username ? 'own-message' : 'other-message'}`}>
                <div className="quick-message-header">
                  <span className="quick-username">{msg.username}</span>
                  <span className="quick-time">{formatTime(msg.timestamp)}</span>
                </div>
                <div className="quick-message-text">{msg.text}</div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="quick-chat-input">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="quick-input"
            maxLength={200}
            disabled={!isConnected}
          />
          <button 
            onClick={sendMessage} 
            disabled={!message.trim() || !isConnected}
            className="quick-send-btn"
          >
            ↑
          </button>
        </div>

        <div className="quick-chat-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '● Connected' : '● Disconnected'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuickChat;