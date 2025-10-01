import React, { useState } from 'react';
import Whiteboard from './Whiteboard';
import '../styles/WhiteboardPage.css';

const WhiteboardPage = () => {
  const [roomCode, setRoomCode] = useState('');
  const [roomName, setRoomName] = useState('');
  const [boardName, setBoardName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdRoomCode, setCreatedRoomCode] = useState('');

  const createNewRoom = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/api/board/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: boardName || `My Whiteboard ${Date.now()}`
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setRoomCode(data.room_code);
        setRoomName(data.room_name);
        setCreatedRoomCode(data.room_code);
        setIsJoined(true);
      } else {
        setError(data.error || 'Failed to create room');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error creating room:', err);
    } finally {
      setLoading(false);
    }
  };

  const joinExistingRoom = async () => {
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/api/board/join/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_code: roomCode.toUpperCase().trim()
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setRoomCode(data.room_code);
        setRoomName(data.room_name);
        setIsJoined(true);
      } else {
        setError(data.error || 'Invalid room code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error joining room:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(createdRoomCode);
    // You could add a toast notification here
    alert('Room code copied to clipboard!');
  };

  const leaveRoom = () => {
    setIsJoined(false);
    setRoomCode('');
    setRoomName('');
    setCreatedRoomCode('');
    setError('');
  };

  if (isJoined) {
    return (
      <div className="whiteboard-wrapper">
        <div className="room-header">
          <div className="room-info">
            <h3>{roomName}</h3>
            <div className="room-code-display">
              <span>Room Code: <strong>{roomCode}</strong></span>
              <button onClick={copyRoomCode} className="copy-btn">
                📋 Copy
              </button>
            </div>
          </div>
          <button onClick={leaveRoom} className="leave-btn">
            🚪 Leave Room
          </button>
        </div>
        <Whiteboard roomName={roomCode} />
      </div>
    );
  }

  return (
    <div className="whiteboard-landing">
      <div className="join-room-container">
        <h1>CollabBoard Whiteboard</h1>
        <p>Create a new whiteboard or join an existing one with a room code</p>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {/* Create New Room Section */}
        <div className="create-section">
          <h3>Create New Whiteboard</h3>
          <div className="create-room-form">
            <input
              type="text"
              placeholder="Whiteboard name (optional)..."
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              className="room-input"
              disabled={loading}
            />
            <button 
              onClick={createNewRoom} 
              className="create-btn"
              disabled={loading}
            >
              {loading ? 'Creating...' : '🚀 Create New Room'}
            </button>
          </div>
        </div>
        
        <div className="divider">
          <span>or</span>
        </div>
        
        {/* Join Existing Room Section */}
        <div className="join-section">
          <h3>Join Existing Whiteboard</h3>
          <div className="join-room-form">
            <input
              type="text"
              placeholder="Enter 8-character room code..."
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="room-input"
              maxLength="8"
              disabled={loading}
            />
            <button 
              onClick={joinExistingRoom} 
              className="join-btn"
              disabled={loading}
            >
              {loading ? 'Joining...' : '🔗 Join Room'}
            </button>
          </div>
        </div>
        
        {/* Room Code Display for Created Room */}
        {createdRoomCode && !isJoined && (
          <div className="room-code-created">
            <h4>Room Created Successfully! 🎉</h4>
            <div className="code-display">
              <span>Share this code with others:</span>
              <div className="code-box">
                <strong>{createdRoomCode}</strong>
                <button onClick={copyRoomCode} className="copy-code-btn">
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

export default WhiteboardPage;