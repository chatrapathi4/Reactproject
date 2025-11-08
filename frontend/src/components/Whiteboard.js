import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { WS_BASE_URL } from '../config';
import '../styles/Whiteboard.css';
import QuickChat from './QuickChat';

const Whiteboard = ({ roomName = 'default-room' }) => {
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pen');
  const [currentColor, setCurrentColor] = useState('#ff00cc');
  const [lineWidth, setLineWidth] = useState(3);
  const [users, setUsers] = useState([]);
  const [drawingObjects, setDrawingObjects] = useState([]);
  const [lastPoint, setLastPoint] = useState(null);
  
  const [username] = useState(`User_${Math.floor(Math.random() * 1000)}`);
  const [isQuickChatOpen, setIsQuickChatOpen] = useState(false);

  // Tools and colors
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

  // Utility: Get pointer position
  const getPointerPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;
    
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  // Define helpers before any useEffect that references them
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const drawRemoteStroke = useCallback((stroke) => {
    const canvas = canvasRef.current;
    if (!canvas || !stroke?.points || stroke.points.length === 0) return;

    const ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = stroke.color || currentColor;
    ctx.lineWidth = stroke.lineWidth || lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    if (stroke.points.length === 1) {
      ctx.arc(stroke.points[0].x, stroke.points[0].y, (stroke.lineWidth || lineWidth) / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      stroke.points.forEach(point => ctx.lineTo(point.x, point.y));
      ctx.stroke();
    }
  }, [currentColor, lineWidth]);

  const redrawCanvas = useCallback(() => {
    clearCanvas();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    drawingObjects.forEach(obj => {
      if (obj.type === 'stroke' && obj.points?.length > 0) {
        ctx.globalCompositeOperation = obj.tool === 'eraser' ? 'destination-out' : 'source-over';
        ctx.strokeStyle = obj.color;
        ctx.lineWidth = obj.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        if (obj.points.length === 1) {
          ctx.arc(obj.points[0].x, obj.points[0].y, obj.lineWidth / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.moveTo(obj.points[0].x, obj.points[0].y);
          obj.points.forEach(point => ctx.lineTo(point.x, point.y));
          ctx.stroke();
        }
      }
    });
  }, [drawingObjects, clearCanvas]);

  // Keep websocket join idempotent across reconnects
  const joinedRef = useRef(false);

  // WebSocket connection
  useEffect(() => {
    if (!roomName) return;

    const clientId = `wb_${Math.floor(Math.random() * 1e9)}`;

    // If already connected to the same room, don't recreate socket
    if (wsRef.current &&
        wsRef.current.url?.includes(`/ws/whiteboard/${roomName}/`) &&
        wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    // Close previous socket if present
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      try { wsRef.current.close(); } catch (e) {}
    }

    let ws;
    try {
      ws = new WebSocket(`${WS_BASE_URL}/ws/whiteboard/${roomName}/`);
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      return;
    }

    wsRef.current = ws;
    joinedRef.current = false;

    ws.onopen = () => {
      console.log('Connected to whiteboard', roomName, clientId);
      // only send join once per logical connection
      if (!joinedRef.current) {
        try {
          ws.send(JSON.stringify({ type: 'join', username, clientId }));
          joinedRef.current = true;
        } catch (err) {
          console.error('Failed to send join:', err);
        }
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'user_list') {
          setUsers(data.users);
        } else {
          switch (data.type) {
            case 'live_stroke':
              drawRemoteStroke(data.stroke);
              break;
            case 'object_added':
              setDrawingObjects(prev => [...prev, data.object]);
              break;
            case 'canvas_cleared':
              setDrawingObjects([]);
              clearCanvas();
              break;
            case 'chat':
              // optional: handle chat in whiteboard UI
              break;
            default:
              break;
          }
        }
      } catch (err) {
        console.error('WS message parse error', err, event.data);
      }
    };

    ws.onclose = (ev) => {
      console.log('Disconnected from whiteboard', ev, 'code=', ev.code, 'reason=', ev.reason);
      if (wsRef.current === ws) wsRef.current = null;
      joinedRef.current = false;
    };

    ws.onerror = (err) => {
      console.error('Whiteboard socket error', err);
    };

    return () => {
      try { ws && ws.close(); } catch (e) {}
      if (wsRef.current === ws) wsRef.current = null;
      joinedRef.current = false;
    };
  }, [roomName, drawRemoteStroke, clearCanvas, username]); // helpers and username as deps

  // Canvas resize listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [redrawCanvas]);

  // Local drawing handlers
  const currentStrokeRef = useRef(null);
  
  const startDrawing = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pos = getPointerPos(e);
    setIsDrawing(true);
    setLastPoint(pos);

    // Start accumulating the stroke
    currentStrokeRef.current = {
      type: 'stroke',
      points: [pos],
      color: currentColor,
      lineWidth,
      tool: currentTool
    };

    const ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = currentTool === 'eraser' ? '#000' : currentColor;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
  }, [getPointerPos, currentTool, currentColor, lineWidth]);

  const draw = useCallback((e) => {
    e.preventDefault();
    if (!isDrawing || !lastPoint) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getPointerPos(e);
    const ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    // Send live stroke for realtime remote drawing
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'draw_stroke',
        points: [lastPoint, pos],
        color: currentColor,
        lineWidth,
        tool: currentTool
      }));
    }

    // Accumulate point into the current stroke
    if (currentStrokeRef.current) {
      currentStrokeRef.current.points.push(pos);
    }

    setLastPoint(pos);
  }, [isDrawing, lastPoint, getPointerPos, currentColor, lineWidth, currentTool]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setLastPoint(null);

    const stroke = currentStrokeRef.current;
    currentStrokeRef.current = null;

    if (stroke) {
      // Persist locally immediately so redraws keep the stroke
      setDrawingObjects(prev => [...prev, stroke]);

      // Send full stroke object to server as the completed object
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'draw_complete',
          object: stroke
        }));
      }
    } else {
      // Fallback minimal message (keeps older behavior)
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'draw_complete', tool: currentTool }));
      }
    }
  }, [isDrawing, currentTool]);

  const clearAll = useCallback(() => {
    setDrawingObjects([]);
    clearCanvas();
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'clear_canvas' }));
    }
  }, [clearCanvas]);

  // Re-render when state changes
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  return (
    <div className="whiteboard-container">
      <div className="whiteboard-toolbar">
        <div className="toolbar-section">
          <h3>Room: {roomName}</h3>
          <div className="connection-status">
            <span className={wsRef.current?.readyState === WebSocket.OPEN ? 'connected' : 'disconnected'}>
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
            className="brush-slider"
          />
          <span className="brush-size">{lineWidth}px</span>
        </div>

        <div className="toolbar-section">
          <button onClick={clearAll} className="clear-btn">Clear Canvas</button>
        </div>

        <div className="toolbar-section">
          <h3>Users ({users.length})</h3>
          <div className="users-list">
            {users.map((user, index) => (
              <div key={index} className="user-chip">{user}</div>
            ))}
          </div>
        </div>

        <div className="toolbar-section">
          <button className="quick-chat-toggle" onClick={() => setIsQuickChatOpen(v => !v)}>
            💬 Quick Chat ({users.length})
          </button>
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
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      <QuickChat
        roomId={roomName}
        roomType="whiteboard"
        username={username}
        isOpen={isQuickChatOpen}
        onToggle={() => setIsQuickChatOpen(v => !v)}
      />
    </div>
  );
};

export default Whiteboard;
