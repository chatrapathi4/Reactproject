import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { WS_BASE_URL } from '../config';

const Whiteboard = ({ roomName = 'default-room' }) => {
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const animationRef = useRef(null);
  const lastSendTime = useRef(0);
  const strokeBuffer = useRef([]);
  const isDrawingRef = useRef(false);
  
  // State management
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pen');
  const [currentColor, setCurrentColor] = useState('#ff00cc');
  const [lineWidth, setLineWidth] = useState(3);
  const [users, setUsers] = useState([]);
  const [drawingObjects, setDrawingObjects] = useState([]);
  const [currentStroke, setCurrentStroke] = useState([]);
  
  // Performance settings
  const SEND_INTERVAL = 16; // ~60fps
  const BATCH_SIZE = 10;
  
  const [username] = useState(`User_${Math.floor(Math.random() * 1000)}`);

  // Optimized tools and colors
  const tools = useMemo(() => [
    { id: 'pen', name: 'Pen', icon: '✏️' },
    { id: 'highlighter', name: 'Highlighter', icon: '🖍️' },
    { id: 'eraser', name: 'Eraser', icon: '🧹' },
    { id: 'line', name: 'Line', icon: '📏' },
    { id: 'rectangle', name: 'Rectangle', icon: '▭' },
    { id: 'circle', name: 'Circle', icon: '○' },
    { id: 'arrow', name: 'Arrow', icon: '➡️' }
  ], []);

  const colors = useMemo(() => [
    '#ff00cc', '#00ffff', '#ffff00', '#ff0000', 
    '#00ff00', '#0000ff', '#ffffff', '#000000',
    '#ff6600', '#9900ff', '#ff0066', '#66ff00'
  ], []);

  // Ultra-fast WebSocket connection
  useEffect(() => {
    if (!roomName) return;

    const ws = new WebSocket(`${WS_BASE_URL}/ws/whiteboard/${roomName}/`);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('Connected to ultra-fast whiteboard');
      ws.send(JSON.stringify({
        type: 'join',
        username: username
      }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'live_stroke':
          drawLiveStroke(data.stroke);
          break;
        case 'object_added':
          setDrawingObjects(prev => [...prev, data.object]);
          break;
        case 'shape_added':
          setDrawingObjects(prev => [...prev, data.shape]);
          break;
        case 'canvas_cleared':
          setDrawingObjects([]);
          clearCanvas();
          break;
        case 'user_list':
          setUsers(data.users);
          break;
        case 'state_sync':
          setDrawingObjects(data.objects);
          break;
      }
    };
    
    ws.onclose = () => {
      console.log('Disconnected from whiteboard');
      // Auto-reconnect after 1 second
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CLOSED) {
          // Reconnect logic here
        }
      }, 1000);
    };
    
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [roomName, username]);

  // Ultra-fast drawing functions
  const getPointerPos = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }, []);

  const startDrawing = useCallback((e) => {
    if (!canvasRef.current) return;
    
    const pos = getPointerPos(e);
    setIsDrawing(true);
    isDrawingRef.current = true;
    
    strokeBuffer.current = [pos];
    setCurrentStroke([pos]);
    
    // Start real-time sending loop
    lastSendTime.current = Date.now();
    sendStrokeData();
  }, [getPointerPos]);

  const draw = useCallback((e) => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    
    const pos = getPointerPos(e);
    strokeBuffer.current.push(pos);
    setCurrentStroke(prev => [...prev, pos]);
    
    // Draw locally immediately
    drawLocalStroke([pos[pos.length - 2], pos].filter(Boolean));
  }, [getPointerPos]);

  const stopDrawing = useCallback(() => {
    if (!isDrawingRef.current) return;
    
    setIsDrawing(false);
    isDrawingRef.current = false;
    
    // Send final stroke data
    if (strokeBuffer.current.length > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'draw_complete',
        points: strokeBuffer.current,
        color: currentColor,
        lineWidth: lineWidth,
        tool: currentTool
      }));
    }
    
    strokeBuffer.current = [];
    setCurrentStroke([]);
  }, [currentColor, lineWidth, currentTool]);

  // Real-time stroke sending with batching
  const sendStrokeData = useCallback(() => {
    if (!isDrawingRef.current) return;
    
    const now = Date.now();
    if (now - lastSendTime.current >= SEND_INTERVAL && strokeBuffer.current.length > 0) {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        // Send batch of points
        const pointsToSend = strokeBuffer.current.slice(-BATCH_SIZE);
        wsRef.current.send(JSON.stringify({
          type: 'draw_stroke',
          points: pointsToSend,
          color: currentColor,
          lineWidth: lineWidth,
          tool: currentTool
        }));
      }
      lastSendTime.current = now;
    }
    
    // Continue sending
    if (isDrawingRef.current) {
      animationRef.current = requestAnimationFrame(sendStrokeData);
    }
  }, [currentColor, lineWidth, currentTool]);

  // Ultra-fast local drawing
  const drawLocalStroke = useCallback((points) => {
    const canvas = canvasRef.current;
    if (!canvas || points.length < 2) return;
    
    const ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = currentTool === 'highlighter' ? `${currentColor}80` : currentColor;
    ctx.lineWidth = currentTool === 'highlighter' ? lineWidth * 2 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.stroke();
  }, [currentColor, lineWidth, currentTool]);

  // Draw live strokes from other users
  const drawLiveStroke = useCallback((stroke) => {
    const canvas = canvasRef.current;
    if (!canvas || !stroke.points || stroke.points.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = stroke.tool === 'highlighter' ? `${stroke.color}80` : stroke.color;
    ctx.lineWidth = stroke.tool === 'highlighter' ? stroke.lineWidth * 2 : stroke.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    if (stroke.points.length === 1) {
      // Single point (dot)
      ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Multiple points (line)
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    }
  }, []);

  // Canvas setup and redraw
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all saved objects
    drawingObjects.forEach(obj => {
      if (obj.type === 'path' && obj.points) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = obj.color;
        ctx.lineWidth = obj.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(obj.points[0].x, obj.points[0].y);
        obj.points.forEach(point => ctx.lineTo(point.x, point.y));
        ctx.stroke();
      }
      // Add other shape types here
    });
    
    // Draw current stroke
    if (currentStroke.length > 0) {
      drawLocalStroke(currentStroke);
    }
  }, [drawingObjects, currentStroke, drawLocalStroke]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const clearAll = useCallback(() => {
    setDrawingObjects([]);
    clearCanvas();
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'clear_canvas' }));
    }
  }, []);

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      
      const ctx = canvas.getContext('2d');
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      
      redrawCanvas();
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [redrawCanvas]);

  // Redraw when objects change
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  return (
    <div className="whiteboard-container">
      {/* Ultra-fast toolbar */}
      <div className="whiteboard-toolbar">
        <div className="toolbar-section">
          <h3>Room: {roomName}</h3>
          <div className="connection-status">
            <span className={wsRef.current?.readyState === WebSocket.OPEN ? 'connected' : 'connecting'}>
              {wsRef.current?.readyState === WebSocket.OPEN ? '● Connected' : '○ Connecting...'}
            </span>
          </div>
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
          onTouchStart={(e) => {
            e.preventDefault();
            startDrawing(e.touches[0]);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            draw(e.touches[0]);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            stopDrawing();
          }}
        />
      </div>
    </div>
  );
};

export default Whiteboard;