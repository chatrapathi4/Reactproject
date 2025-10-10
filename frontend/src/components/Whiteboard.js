import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { WS_BASE_URL } from '../config';

const Whiteboard = ({ roomName = 'default-room' }) => {
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pen');
  const [currentColor, setCurrentColor] = useState('#ff00cc');
  const [lineWidth, setLineWidth] = useState(3);
  const [users, setUsers] = useState([]);
  const [drawingObjects, setDrawingObjects] = useState([]);
  
  const [username] = useState(`User_${Math.floor(Math.random() * 1000)}`);

  // Simple tools and colors
  const tools = useMemo(() => [
    { id: 'pen', name: 'Pen', icon: '✏️' },
    { id: 'eraser', name: 'Eraser', icon: '🧹' },
    { id: 'line', name: 'Line', icon: '📏' },
    { id: 'rectangle', name: 'Rectangle', icon: '▭' },
    { id: 'circle', name: 'Circle', icon: '○' }
  ], []);

  const colors = useMemo(() => [
    '#ff00cc', '#00ffff', '#ffff00', '#ff0000', 
    '#00ff00', '#0000ff', '#ffffff', '#000000'
  ], []);

  // Simple WebSocket connection
  useEffect(() => {
    if (!roomName) return;

    const ws = new WebSocket(`${WS_BASE_URL}/ws/whiteboard/${roomName}/`);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('Connected to whiteboard');
      ws.send(JSON.stringify({
        type: 'join',
        username: username
      }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received:', data);
      
      switch (data.type) {
        case 'live_stroke':
          // Handle real-time drawing
          break;
        case 'object_added':
          setDrawingObjects(prev => [...prev, data.object]);
          break;
        case 'canvas_cleared':
          setDrawingObjects([]);
          clearCanvas();
          break;
        case 'user_list':
          setUsers(data.users);
          break;
      }
    };
    
    ws.onclose = () => {
      console.log('Disconnected from whiteboard');
    };
    
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [roomName, username]);

  // Simple drawing functions
  const startDrawing = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    // Simple drawing logic here
  }, []);

  const draw = useCallback((e) => {
    if (!isDrawing) return;
    // Simple drawing logic
  }, [isDrawing]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearAll = useCallback(() => {
    setDrawingObjects([]);
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'clear_canvas' }));
    }
  }, []);

  return (
    <div className="whiteboard-container">
      <div className="whiteboard-toolbar">
        <div className="toolbar-section">
          <h3>Room: {roomName}</h3>
        </div>
        
        <div className="toolbar-section">
          <h3>Tools</h3>
          <div className="tool-buttons">
            {tools.map(tool => (
              <button
                key={tool.id}
                className={`tool-btn ${currentTool === tool.id ? 'active' : ''}`}
                onClick={() => setCurrentTool(tool.id)}
              >
                {tool.icon}
              </button>
            ))}
          </div>
        </div>
        
        <div className="toolbar-section">
          <h3>Colors</h3>
          <div className="color-palette">
            {colors.map(color => (
              <button
                key={color}
                className={`color-btn ${currentColor === color ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setCurrentColor(color)}
              />
            ))}
          </div>
        </div>
        
        <div className="toolbar-section">
          <h3>Brush Size</h3>
          <input
            type="range"
            min="1"
            max="50"
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
          />
          <span>{lineWidth}px</span>
        </div>
        
        <div className="toolbar-section">
          <button onClick={clearAll} className="clear-btn">
            Clear Canvas
          </button>
        </div>
        
        <div className="toolbar-section">
          <h3>Users ({users.length})</h3>
          <div className="users-list">
            {users.map(user => (
              <div key={user} className="user-chip">{user}</div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          className="whiteboard-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
    </div>
  );
};

export default Whiteboard;