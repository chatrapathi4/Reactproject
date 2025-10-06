import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Chat from './Chat';
import '../styles/ChatPage.css';

const ChatPage = () => {
  const [chatId, setChatId] = useState('');
  const [chatName, setChatName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdChatId, setCreatedChatId] = useState('');
  const navigate = useNavigate();

  const createNewChat = () => {
    setLoading(true);
    setError('');
    
    try {
      // Generate a unique chat ID
      const newChatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const newChatName = chatName || `Chat Room ${Date.now()}`;
      
      setChatId(newChatId);
      setCreatedChatId(newChatId);
      setIsJoined(true);
    } catch (err) {
      setError('Failed to create chat room. Please try again.');
      console.error('Error creating chat:', err);
    } finally {
      setLoading(false);
    }
  };

  const joinExistingChat = () => {
    if (!chatId.trim()) {
      setError('Please enter a chat room ID');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // For now, just join any chat ID (you can add validation later)
      setIsJoined(true);
    } catch (err) {
      setError('Failed to join chat room. Please try again.');
      console.error('Error joining chat:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyChatId = () => {
    const idToCopy = createdChatId || chatId;
    navigator.clipboard.writeText(idToCopy);
  };

  const leaveChat = () => {
    setIsJoined(false);
    setChatId('');
    setChatName('');
    setCreatedChatId('');
    setError('');
  };

  if (isJoined) {
    return (
      <div className="chat-wrapper">
        <div className="chat-header">
          <div className="chat-info">
            <h3>{chatName || `Chat Room`}</h3>
            <div className="chat-id-display">
              <span>Chat ID: <strong>{chatId}</strong></span>
              <button onClick={copyChatId} className="copy-btn">
                📋 Copy
              </button>
            </div>
          </div>
          <button onClick={leaveChat} className="leave-btn">
            🚪 Leave Chat
          </button>
        </div>
        <Chat chatId={chatId} />
      </div>
    );
  }

  return (
    <div className="chat-landing">
      <div className="join-chat-container">
        <h1>CollabBoard Chat</h1>
        <p>Create a new chat room or join an existing one with a chat ID</p>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {/* Create New Chat Section */}
        <div className="create-section">
          <h3>Create New Chat Room</h3>
          <div className="create-chat-form">
            <input
              type="text"
              placeholder="Chat room name (optional)..."
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              className="chat-input"
              disabled={loading}
            />
            <button 
              onClick={createNewChat} 
              className="create-btn"
              disabled={loading}
            >
              {loading ? 'Creating...' : '💬 Create New Chat'}
            </button>
          </div>
        </div>
        
        <div className="divider">
          <span>or</span>
        </div>
        
        {/* Join Existing Chat Section */}
        <div className="join-section">
          <h3>Join Existing Chat Room</h3>
          <div className="join-chat-form">
            <input
              type="text"
              placeholder="Enter chat room ID..."
              value={chatId}
              onChange={(e) => setChatId(e.target.value.trim())}
              className="chat-input"
              disabled={loading}
            />
            <button 
              onClick={joinExistingChat} 
              className="join-btn"
              disabled={loading}
            >
              {loading ? 'Joining...' : '🔗 Join Chat'}
            </button>
          </div>
        </div>

        {/* Chat ID Display for Created Chat */}
        {createdChatId && !isJoined && (
          <div className="chat-id-created">
            <h4>Chat Room Created Successfully! 🎉</h4>
            <div className="id-display">
              <span>Share this ID with others:</span>
              <div className="id-box">
                <strong>{createdChatId}</strong>
                <button onClick={copyChatId} className="copy-id-btn">
                  📋
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Join Options */}
        <div className="quick-join-section">
          <h3>Quick Join</h3>
          <div className="quick-join-buttons">
            <button onClick={() => { setChatId('general'); joinExistingChat(); }} className="quick-btn">
              🌐 General Chat
            </button>
            <button onClick={() => { setChatId('tech'); joinExistingChat(); }} className="quick-btn">
              💻 Tech Discussion
            </button>
            <button onClick={() => { setChatId('random'); joinExistingChat(); }} className="quick-btn">
              🎲 Random Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;