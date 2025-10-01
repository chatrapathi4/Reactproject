import React, { useState } from 'react';
import '../styles/NavbarFixed.css';

function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Ensure it starts as false

  const sidebarItems = [
    { icon: '🖼️', name: 'Whiteboard', path: '/whiteboard', component: 'WhiteboardPage' },
    { icon: '💻', name: 'IDE', path: '/ide' },
    { icon: '💬', name: 'Chat', path: '/chat' },
    { icon: '📂', name: 'File Manager', path: '/files' },
    { icon: '📊', name: 'Dashboard', path: '/dashboard' },
    { icon: '📝', name: 'Notes/Docs', path: '/notes' },
    { icon: '⚙️', name: 'Settings', path: '/settings' },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <div className="navbar-logo">CollabBoard</div>
        </div>
        
        <div className="navbar-center">
          <a href="#home" className="navbar-link">Home</a>
          <a href="#about" className="navbar-link">About</a>
          <a href="#products" className="navbar-link">Products</a>
          <a href="#feedback" className="navbar-link">Feedback</a>
          <a href="#contact" className="navbar-link">Contact</a>
        </div>
        
        <div className="navbar-right">
          <button 
            className={`hamburger ${isSidebarOpen ? 'open' : ''}`}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Sidebar - only show when open */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Platform Tools</h3>
          <button 
            className="sidebar-close"
            onClick={() => setIsSidebarOpen(false)}
          >
            ✕
          </button>
        </div>
        
        <div className="sidebar-content">
          {sidebarItems.map((item, index) => (
            <a 
              key={index}
              href={item.path} 
              className="sidebar-item"
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-text">{item.name}</span>
            </a>
          ))}
        </div>
        
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">👤</div>
            <div className="user-details">
              <span className="username">John Doe</span>
              <span className="user-status">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay - only show when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </>
  );
}

export default Navbar;