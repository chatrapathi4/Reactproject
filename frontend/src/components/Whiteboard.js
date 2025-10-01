import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Whiteboard.css';

const Whiteboard = ({ roomName = 'default-room' }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pen');
  const [currentColor, setCurrentColor] = useState('#ff00cc');
  const [lineWidth, setLineWidth] = useState(2);
  const [users, setUsers] = useState([]);
  const [username] = useState(`User_${Math.floor(Math.random() * 1000)}`);
  const wsRef = useRef(null);
  const [objects, setObjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Set drawing properties
    context.lineCap = 'round';
    context.lineJoin = 'round';
    
    // Connect to WebSocket
    const ws = new WebSocket(`ws://localhost:8000/ws/whiteboard/${roomName}/`);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('Connected to whiteboard');
      // Join the room
      ws.send(JSON.stringify({
        type: 'join',
        username: username
      }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'update') {
        setObjects(data.objects);
        redrawCanvas(context, data.objects);
      } else if (data.type === 'user_list') {
        setUsers(data.users);
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

  const redrawCanvas = (context, objectsToRedraw) => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    
    objectsToRedraw.forEach(obj => {
      if (obj.type === 'path') {
        context.beginPath();
        context.strokeStyle = obj.color;
        context.lineWidth = obj.lineWidth;
        
        obj.points.forEach((point, index) => {
          if (index === 0) {
            context.moveTo(point.x, point.y);
          } else {
            context.lineTo(point.x, point.y);
          }
        });
        context.stroke();
      }
    });
  };

  const startDrawing = (e) => {
    if (currentTool !== 'pen') return;
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newPath = {
      type: 'path',
      color: currentColor,
      lineWidth: lineWidth,
      points: [{ x, y }]
    };
    
    setObjects(prev => [...prev, newPath]);
  };

  const draw = (e) => {
    if (!isDrawing || currentTool !== 'pen') return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setObjects(prev => {
      const newObjects = [...prev];
      const currentPath = newObjects[newObjects.length - 1];
      currentPath.points.push({ x, y });
      
      // Send update to WebSocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'update',
          objects: newObjects
        }));
      }
      
      return newObjects;
    });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    setObjects([]);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'update',
        objects: []
      }));
    }
  };

  const goBackToLanding = () => {
    navigate('/');
  };

  const tools = [
    { id: 'pen', name: 'Pen', icon: '✏️' },
    { id: 'eraser', name: 'Eraser', icon: '🧹' },
    { id: 'select', name: 'Select', icon: '👆' }
  ];

  const colors = ['#ff00cc', '#00ffff', '#ffff00', '#ff0000', '#00ff00', '#0000ff', '#ffffff', '#000000'];

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
                title={tool.name}
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
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
            className="brush-slider"
          />
          <span className="brush-size">{lineWidth}px</span>
        </div>
        
        <div className="toolbar-section">
          <button className="clear-btn" onClick={clearCanvas}>
            Clear Canvas
          </button>
        </div>
        
        <div className="toolbar-section">
          <h3>Users ({users.length})</h3>
          <div className="users-list">
            {users.map(user => (
              <div key={user} className="user-chip">
                {user}
              </div>
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