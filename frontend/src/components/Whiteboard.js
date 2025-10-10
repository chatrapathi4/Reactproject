import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import QuickChat from './QuickChat';
import ChatButton from './ChatButton';
import '../styles/Whiteboard.css';
import { WS_BASE_URL } from '../config';

const Whiteboard = ({ roomName = 'default-room', roomCode: propRoomCode }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pen');
  const [currentColor, setCurrentColor] = useState('#ff00cc');
  const [lineWidth, setLineWidth] = useState(2);
  const [users, setUsers] = useState([]);
  const [username] = useState(`User_${Math.floor(Math.random() * 1000)}`);
  const wsRef = useRef(null);
  const [drawingObjects, setDrawingObjects] = useState([]);
  const [currentPath, setCurrentPath] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Performance optimizations
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const updateThrottle = 16; // ~60fps
  
  // Enhanced tools
  const [shapes, setShapes] = useState([]);
  const [selectedShape, setSelectedShape] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });

  // Memoized tools array
  const tools = useMemo(() => [
    { id: 'pen', name: 'Pen', icon: '✏️' },
    { id: 'eraser', name: 'Eraser', icon: '🧹' },
    { id: 'line', name: 'Line', icon: '📏' },
    { id: 'rectangle', name: 'Rectangle', icon: '▭' },
    { id: 'circle', name: 'Circle', icon: '○' },
    { id: 'arrow', name: 'Arrow', icon: '➡️' },
    { id: 'text', name: 'Text', icon: '🔤' },
    { id: 'select', name: 'Select', icon: '👆' },
    { id: 'move', name: 'Move', icon: '✋' },
    { id: 'zoom', name: 'Zoom', icon: '🔍' }
  ], []);

  const colors = useMemo(() => [
    '#ff00cc', '#00ffff', '#ffff00', '#ff0000', 
    '#00ff00', '#0000ff', '#ffffff', '#000000',
    '#ff6600', '#9900ff', '#ff0066', '#66ff00'
  ], []);

  // Throttled drawing function
  const throttledDraw = useCallback((point) => {
    const now = Date.now();
    if (now - lastUpdateTime < updateThrottle) return;
    
    setLastUpdateTime(now);
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'draw_path',
        path: {
          points: [point],
          color: currentColor,
          lineWidth: lineWidth,
          tool: currentTool
        }
      }));
    }
  }, [currentColor, lineWidth, currentTool, lastUpdateTime]);

  // Enhanced drawing functions
  const startDrawing = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (currentTool === 'text') {
      setIsTyping(true);
      setTextPosition({ x, y });
      return;
    }
    
    setIsDrawing(true);
    
    if (currentTool === 'pen') {
      const newPath = {
        type: 'path',
        color: currentColor,
        lineWidth: lineWidth,
        points: [{ x, y }],
        id: Date.now()
      };
      setCurrentPath(newPath);
    } else if (['line', 'rectangle', 'circle', 'arrow'].includes(currentTool)) {
      const newShape = {
        type: currentTool,
        startX: x,
        startY: y,
        endX: x,
        endY: y,
        color: currentColor,
        lineWidth: lineWidth,
        id: Date.now()
      };
      setShapes(prev => [...prev, newShape]);
    }
  }, [currentTool, currentColor, lineWidth]);

  const draw = useCallback((e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (currentTool === 'pen' && currentPath) {
      const updatedPath = {
        ...currentPath,
        points: [...currentPath.points, { x, y }]
      };
      setCurrentPath(updatedPath);
      throttledDraw({ x, y });
    } else if (['line', 'rectangle', 'circle', 'arrow'].includes(currentTool)) {
      setShapes(prev => {
        const newShapes = [...prev];
        const lastShape = newShapes[newShapes.length - 1];
        if (lastShape) {
          lastShape.endX = x;
          lastShape.endY = y;
        }
        return newShapes;
      });
    }
  }, [isDrawing, currentTool, currentPath, throttledDraw]);

  const stopDrawing = useCallback(() => {
    if (isDrawing && currentPath) {
      setDrawingObjects(prev => [...prev, currentPath]);
      setCurrentPath(null);
    }
    setIsDrawing(false);
  }, [isDrawing, currentPath]);

  // Text handling
  const handleTextSubmit = useCallback(() => {
    if (textInput.trim()) {
      const textObject = {
        type: 'text',
        x: textPosition.x,
        y: textPosition.y,
        text: textInput,
        color: currentColor,
        fontSize: lineWidth * 8,
        id: Date.now()
      };
      
      setDrawingObjects(prev => [...prev, textObject]);
      
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'add_text',
          textObject
        }));
      }
    }
    
    setIsTyping(false);
    setTextInput('');
  }, [textInput, textPosition, currentColor, lineWidth]);

  // Enhanced canvas rendering
  const redrawCanvas = useCallback((context, objectsToRedraw, currentShapes = []) => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    
    // Draw saved objects
    objectsToRedraw.forEach(obj => {
      switch (obj.type) {
        case 'path':
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
          break;
          
        case 'text':
          context.fillStyle = obj.color;
          context.font = `${obj.fontSize}px Arial`;
          context.fillText(obj.text, obj.x, obj.y);
          break;
          
        case 'line':
          context.beginPath();
          context.strokeStyle = obj.color;
          context.lineWidth = obj.lineWidth;
          context.moveTo(obj.startX, obj.startY);
          context.lineTo(obj.endX, obj.endY);
          context.stroke();
          break;
          
        case 'rectangle':
          context.strokeStyle = obj.color;
          context.lineWidth = obj.lineWidth;
          context.strokeRect(
            obj.startX, 
            obj.startY, 
            obj.endX - obj.startX, 
            obj.endY - obj.startY
          );
          break;
          
        case 'circle':
          const radius = Math.sqrt(
            Math.pow(obj.endX - obj.startX, 2) + Math.pow(obj.endY - obj.startY, 2)
          );
          context.beginPath();
          context.strokeStyle = obj.color;
          context.lineWidth = obj.lineWidth;
          context.arc(obj.startX, obj.startY, radius, 0, 2 * Math.PI);
          context.stroke();
          break;
          
        case 'arrow':
          drawArrow(context, obj.startX, obj.startY, obj.endX, obj.endY, obj.color, obj.lineWidth);
          break;
      }
    });
    
    // Draw current shapes being created
    currentShapes.forEach(shape => {
      // Similar rendering logic for shapes
    });
    
    // Draw current path
    if (currentPath) {
      context.beginPath();
      context.strokeStyle = currentPath.color;
      context.lineWidth = currentPath.lineWidth;
      currentPath.points.forEach((point, index) => {
        if (index === 0) {
          context.moveTo(point.x, point.y);
        } else {
          context.lineTo(point.x, point.y);
        }
      });
      context.stroke();
    }
  }, [currentPath]);

  // Arrow drawing helper
  const drawArrow = (ctx, fromX, fromY, toX, toY, color, lineWidth) => {
    const headLength = 20;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    
    // Draw line
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    
    // Draw arrowhead
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    
    ctx.stroke();
  };

  // Add undo/redo functionality
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...drawingObjects]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, drawingObjects]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setDrawingObjects(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setDrawingObjects(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  // Enhanced WebSocket connection with reconnection
  useEffect(() => {
    const connectWebSocket = () => {
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
        
        switch (data.type) {
          case 'update':
            setDrawingObjects(data.objects);
            break;
          case 'draw_path':
            // Handle real-time drawing
            setCurrentPath(data.path);
            break;
          case 'user_list':
            setUsers(data.users);
            break;
        }
      };
      
      ws.onclose = () => {
        console.log('Disconnected from whiteboard');
        // Attempt reconnection after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };
    
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [roomName, username]);

  // Canvas setup and rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      redrawCanvas(context, drawingObjects, shapes);
    }
  }, [drawingObjects, shapes, redrawCanvas]);

  return (
    <div className="whiteboard-container">
      <div className="whiteboard-toolbar">
        {/* Room Info */}
        <div className="toolbar-section">
          <h3>Room: {roomName}</h3>
          <div className="room-actions">
            <button className="action-btn" onClick={undo} disabled={historyIndex <= 0}>
              ↶ Undo
            </button>
            <button className="action-btn" onClick={redo} disabled={historyIndex >= history.length - 1}>
              ↷ Redo
            </button>
          </div>
        </div>
        
        {/* Enhanced Tools */}
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
        
        {/* Colors */}
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
        
        {/* Brush Size */}
        <div className="toolbar-section">
          <h3>Brush Size</h3>
          <input
            type="range"
            min="1"
            max="50"
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
            className="brush-slider"
          />
          <span className="brush-size">{lineWidth}px</span>
        </div>
        
        {/* Actions */}
        <div className="toolbar-section">
          <button className="clear-btn" onClick={() => {
            setDrawingObjects([]);
            setShapes([]);
            saveToHistory();
          }}>
            Clear Canvas
          </button>
          
          <button className="save-btn" onClick={() => {
            const canvas = canvasRef.current;
            const link = document.createElement('a');
            link.download = `whiteboard-${roomName}.png`;
            link.href = canvas.toDataURL();
            link.click();
          }}>
            📥 Save Image
          </button>
        </div>
        
        {/* Users */}
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
        
        {/* Text Input Overlay */}
        {isTyping && (
          <div 
            className="text-input-overlay"
            style={{ 
              position: 'absolute', 
              left: textPosition.x, 
              top: textPosition.y,
              zIndex: 1000 
            }}
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleTextSubmit();
                if (e.key === 'Escape') setIsTyping(false);
              }}
              onBlur={handleTextSubmit}
              autoFocus
              style={{
                fontSize: `${lineWidth * 8}px`,
                color: currentColor,
                background: 'transparent',
                border: '1px dashed #fff',
                outline: 'none'
              }}
            />
          </div>
        )}
      </div>

      {/* Chat Button */}
      <ChatButton 
        onClick={toggleChat}
        isOpen={isChatOpen}
      />

      {/* Quick Chat */}
      <QuickChat
        roomId={roomName}
        roomType="whiteboard"
        username={username}
        isOpen={isChatOpen}
        onToggle={toggleChat}
      />
    </div>
  );
};

export default Whiteboard;