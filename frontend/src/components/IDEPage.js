import React, { useState } from 'react';
import IDE from './IDE';
import '../styles/IDEPage.css';

const IDEPage = () => {
  const [sessionId, setSessionId] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdSessionId, setCreatedSessionId] = useState('');

  const createNewSession = () => {
    setLoading(true);
    setError('');
    
    // Generate a random session ID
    const newSessionId = `IDE_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    setTimeout(() => {
      setSessionId(newSessionId);
      setCreatedSessionId(newSessionId);
      setIsJoined(true);
      setLoading(false);
    }, 500);
  };

  const joinExistingSession = () => {
    if (!sessionId.trim()) {
      setError('Please enter a session ID');
      return;
    }
    
    setLoading(true);
    setError('');
    
    setTimeout(() => {
      setIsJoined(true);
      setLoading(false);
    }, 500);
  };

  const copySessionId = () => {
    navigator.clipboard.writeText(createdSessionId);
    alert('Session ID copied to clipboard!');
  };

  const leaveSession = () => {
    setIsJoined(false);
    setSessionId('');
    setSessionName('');
    setCreatedSessionId('');
    setError('');
  };

  if (isJoined) {
    return (
      <div className="ide-wrapper">
        <div className="session-header">
          <div className="session-info">
            <h3>Python IDE Session</h3>
            <div className="session-id-display">
              <span>Session ID: <strong>{sessionId}</strong></span>
              <button onClick={copySessionId} className="copy-btn">
                📋 Copy
              </button>
            </div>
          </div>
          <button onClick={leaveSession} className="leave-btn">
            🚪 Leave Session
          </button>
        </div>
        <IDE ideId={sessionId} />
      </div>
    );
  }

  return (
    <div className="ide-landing">
      <div className="join-session-container">
        <h1>CollabBoard Python IDE</h1>
        <p>Create a new coding session or join an existing one with a session ID</p>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {/* Create New Session Section */}
        <div className="create-section">
          <h3>Create New Session</h3>
          <div className="create-session-form">
            <input
              type="text"
              placeholder="Session name (optional)..."
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              className="session-input"
              disabled={loading}
            />
            <button 
              onClick={createNewSession} 
              className="create-btn"
              disabled={loading}
            >
              {loading ? 'Creating...' : '🚀 Create New Session'}
            </button>
          </div>
        </div>
        
        <div className="divider">
          <span>or</span>
        </div>
        
        {/* Join Existing Session Section */}
        <div className="join-section">
          <h3>Join Existing Session</h3>
          <div className="join-session-form">
            <input
              type="text"
              placeholder="Enter session ID..."
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value.toUpperCase())}
              className="session-input"
              disabled={loading}
            />
            <button 
              onClick={joinExistingSession} 
              className="join-btn"
              disabled={loading}
            >
              {loading ? 'Joining...' : '🔗 Join Session'}
            </button>
          </div>
        </div>

        {/* Session ID Display for Created Session */}
        {createdSessionId && !isJoined && (
          <div className="session-id-created">
            <h4>Session Created Successfully! 🎉</h4>
            <div className="id-display">
              <span>Share this ID with others:</span>
              <div className="id-box">
                <strong>{createdSessionId}</strong>
                <button onClick={copySessionId} className="copy-id-btn">
                  📋
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IDEPage;