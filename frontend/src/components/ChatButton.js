import React from 'react';
import '../styles/ChatButton.css';

const ChatButton = ({ onClick, isOpen, unreadCount = 0 }) => {
  return (
    <button 
      className={`chat-toggle-btn ${isOpen ? 'open' : ''}`}
      onClick={onClick}
      title={isOpen ? 'Close Chat' : 'Open Quick Chat'}
    >
      <div className="chat-btn-content">
        <span className="chat-btn-icon">💬</span>
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </div>
      <div className="chat-btn-label">
        {isOpen ? 'Close' : 'Chat'}
      </div>
    </button>
  );
};

export default ChatButton;