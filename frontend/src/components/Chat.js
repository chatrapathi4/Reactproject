import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/Chat.css';
import { WS_BASE_URL } from '../config';

function Chat({ chatId: propChatId }) {
  const { chatId: urlChatId } = useParams();
  const chatId = propChatId || urlChatId;
  
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!chatId) return;

    let isMounted = true;
    let reconnectDelay = 1000;
    let ws = null;
    let shouldReconnect = true;

    const connect = () => {
      console.log('Attempting WS →', `${WS_BASE_URL}/ws/chat/${chatId}/`);
      ws = new WebSocket(`${WS_BASE_URL}/ws/chat/${chatId}/`);

      ws.onopen = () => {
        console.log('Connected to chat WebSocket');
        reconnectDelay = 1000;
        setIsConnected(true);
        setSocket(ws);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received:', data);
          if (data.type === 'chat') {
            setMessages(prev => [...prev, data.message]);
          } else if (data.type === 'user_list') {
            setUsers(data.users);
          }
        } catch (e) {
          console.error('WS parse error', e, event.data);
        }
      };

      ws.onclose = (ev) => {
        console.warn('Chat WebSocket closed', ev);
        setIsConnected(false);
        setSocket(null);
        if (shouldReconnect && isMounted) {
          setTimeout(() => {
            reconnectDelay = Math.min(10000, reconnectDelay * 1.5);
            connect();
          }, reconnectDelay);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
      };
    };

    connect();

    return () => {
      isMounted = false;
      shouldReconnect = false;
      try { ws && ws.close(); } catch (e) {}
    };
  }, [chatId]);

  const joinChat = () => {
    if (socket && username.trim() && !hasJoined) {
      socket.send(JSON.stringify({
        type: 'join',
        username: username.trim()
      }));
      setHasJoined(true);
    }
  };

  const sendMessage = () => {
    if (socket && message.trim() && hasJoined) {
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
      if (!hasJoined) {
        joinChat();
      } else {
        sendMessage();
      }
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (!hasJoined) {
    return (
      <div className="chat-container">
        {/* Join Form */}
        <div className="join-form">
          <div className="join-card">
            <h2>Join Chat Room</h2>
            <p>Chat ID: <strong>{chatId}</strong></p>
            <div className="form-group">
              <label htmlFor="username">Enter your username:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Your username"
                maxLength={30}
              />
            </div>
            <button 
              onClick={joinChat} 
              disabled={!username.trim() || !isConnected}
              className="join-btn"
            >
              {isConnected ? 'Join Chat' : 'Connecting...'}
            </button>
            <div className="connection-status">
              Status: <span className={isConnected ? 'connected' : 'disconnected'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Chat Interface */}
      <div className="chat-interface">
        {/* Users Panel */}
        <div className="users-panel">
          <h3>Online Users ({users.length})</h3>
          <div className="users-list">
            {users.map((user, index) => (
              <div key={index} className="user-item">
                <span className="user-status">●</span>
                <span className="user-name">{user}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Messages Panel */}
        <div className="messages-panel">
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="no-messages">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className={`message ${msg.username === username ? 'own-message' : 'other-message'}`}>
                  <div className="message-header">
                    <span className="message-username">{msg.username}</span>
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                  </div>
                  <div className="message-text">{msg.text}</div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="message-input-container">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="message-input"
              maxLength={500}
            />
            <button 
              onClick={sendMessage} 
              disabled={!message.trim() || !isConnected}
              className="send-btn"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="status-bar">
        <span className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '● Connected' : '● Disconnected'}
        </span>
        <span className="user-info">Logged in as: {username}</span>
      </div>
    </div>
  );
}

export default Chat;