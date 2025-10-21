import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import QuickChat from './QuickChat';
import ChatButton from './ChatButton';
import '../styles/IDE.css';
import { WS_BASE_URL } from '../config';

function IDE({ ideId: propIdeId }) {
  const { ideId: urlIdeId } = useParams();
  const ideId = propIdeId || urlIdeId || 'default-ide';
  
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [files, setFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [code, setCode] = useState('# Welcome to CollabBoard Python IDE\n# Start coding here...\n\n');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  
  // Quick Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const codeEditorRef = useRef(null);

  useEffect(() => {
    if (!ideId) return;

    const clientId = `ide_${Math.floor(Math.random()*1e9)}`;
    const ws = new WebSocket(`${WS_BASE_URL}/ws/ide/${ideId}/`);
    let joined = false;

    ws.onopen = () => {
      console.log('Connected to IDE WebSocket', ideId, clientId);
      setIsConnected(true);
      if (!joined) {
        ws.send(JSON.stringify({ type: 'join', username: username || `User_${clientId.slice(-4)}`, clientId }));
        joined = true;
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received:', data);

      switch (data.type) {
        case 'code_update':
          setCode(data.code);
          break;
        case 'file_change':
          setCurrentFile(data.file);
          setCode(data.code);
          break;
        case 'user_list':
          setUsers(data.users);
          break;
        case 'output':
          setOutput(prev => prev + data.output);
          break;
        case 'run_complete':
          setIsRunning(false);
          break;
        default:
          break;
      }
    };

    ws.onclose = () => {
      console.log('IDE WebSocket connection closed');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setSocket(ws);

    // Initialize with default files
    setFiles([
      { name: 'main.py', code: code, language: 'python' },
      { name: 'utils.py', code: '# Utility functions\n\n', language: 'python' },
    ]);
    setCurrentFile({ name: 'main.py', language: 'python' });

    return () => {
      ws.close();
    };
  }, [ideId]);

  const joinIDE = () => {
    if (socket && username.trim() && !hasJoined) {
      socket.send(JSON.stringify({
        type: 'join',
        username: username.trim()
      }));
      setHasJoined(true);
    }
  };

  const handleCodeChange = (event) => {
    const newCode = event.target.value;
    setCode(newCode);
    
    // Send code update to other users
    if (socket && hasJoined) {
      socket.send(JSON.stringify({
        type: 'code_update',
        code: newCode,
        file: currentFile?.name || 'main.py'
      }));
    }
  };

  const runCode = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setOutput('Running code...\n');
    
    try {
      // Simulate Python code execution
      // In a real implementation, you'd send this to a backend service
      setTimeout(() => {
        const simulatedOutput = `>>> Executing ${currentFile?.name || 'main.py'}\n${code}\n\n>>> Execution completed successfully!\n`;
        setOutput(simulatedOutput);
        setIsRunning(false);
        
        if (socket && hasJoined) {
          socket.send(JSON.stringify({
            type: 'output',
            output: simulatedOutput
          }));
        }
      }, 1000);
    } catch (error) {
      setOutput(prev => prev + `Error: ${error.message}\n`);
      setIsRunning(false);
    }
  };

  const saveFile = () => {
    if (currentFile) {
      // Update the file in the files array
      setFiles(prev => prev.map(file => 
        file.name === currentFile.name 
          ? { ...file, code }
          : file
      ));
      
      // Show success message
      setOutput(prev => prev + `File ${currentFile.name} saved successfully!\n`);
    }
  };

  const createNewFile = () => {
    if (newFileName.trim()) {
      const fileName = newFileName.trim();
      const extension = fileName.split('.').pop();
      const language = extension === 'py' ? 'python' : 'text';
      
      const newFile = {
        name: fileName,
        code: `# ${fileName}\n\n`,
        language
      };
      
      setFiles(prev => [...prev, newFile]);
      setCurrentFile(newFile);
      setCode(newFile.code);
      setNewFileName('');
      setShowNewFileDialog(false);
    }
  };

  const selectFile = (file) => {
    setCurrentFile(file);
    setCode(file.code);
    
    if (socket && hasJoined) {
      socket.send(JSON.stringify({
        type: 'file_change',
        file: file.name,
        code: file.code
      }));
    }
  };

  const deleteFile = (fileName) => {
    setFiles(prev => prev.filter(file => file.name !== fileName));
    if (currentFile?.name === fileName) {
      const remainingFiles = files.filter(file => file.name !== fileName);
      if (remainingFiles.length > 0) {
        selectFile(remainingFiles[0]);
      } else {
        setCurrentFile(null);
        setCode('');
      }
    }
  };

  const clearOutput = () => {
    setOutput('');
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  if (!hasJoined) {
    return (
      <div className="ide-container">
        <div className="join-form">
          <div className="join-card">
            <h2>Python IDE</h2>
            <p>IDE Session: <strong>{ideId}</strong></p>
            <div className="form-group">
              <label htmlFor="username">Enter your username:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && joinIDE()}
                placeholder="Your username"
                maxLength={30}
              />
            </div>
            <button 
              onClick={joinIDE} 
              disabled={!username.trim() || !isConnected}
              className="join-btn"
            >
              {isConnected ? 'Join IDE Session' : 'Connecting...'}
            </button>
            <div className="connection-status">
              Status: <span className={isConnected ? 'connected' : 'disconnected'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ide-container">
      <div className="ide-interface">
        {/* Sidebar */}
        <div className="ide-sidebar">
          <div className="sidebar-section">
            <h3>Files</h3>
            <div className="file-list">
              {files.map((file, index) => (
                <div 
                  key={index}
                  className={`file-item ${currentFile?.name === file.name ? 'active' : ''}`}
                  onClick={() => selectFile(file)}
                >
                  <span className="file-icon">🐍</span>
                  <span className="file-name">{file.name}</span>
                  {files.length > 1 && (
                    <button 
                      className="delete-file-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFile(file.name);
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button 
              className="new-file-btn"
              onClick={() => setShowNewFileDialog(true)}
            >
              + New File
            </button>
          </div>

          <div className="sidebar-section">
            <h3>Connected Users</h3>
            <div className="users-list">
              {users.map((user, index) => (
                <div key={index} className="user-item">
                  <span className="user-status">●</span>
                  <span className="user-name">{user}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main IDE Area */}
        <div className="ide-main">
          {/* Toolbar */}
          <div className="ide-toolbar">
            <div className="file-info">
              <span className="current-file">{currentFile?.name || 'No file selected'}</span>
              {currentFile && (
                <span className="file-language">{currentFile.language}</span>
              )}
            </div>
            <div className="toolbar-actions">
              <button 
                onClick={saveFile}
                className="save-btn"
                disabled={!currentFile}
              >
                💾 Save
              </button>
              <button 
                onClick={runCode}
                className="run-btn"
                disabled={isRunning || !currentFile}
              >
                {isRunning ? '⏳ Running...' : '▶️ Run'}
              </button>
            </div>
          </div>

          {/* Editor Area */}
          <div className="editor-area">
            <textarea
              ref={codeEditorRef}
              className="code-editor"
              value={code}
              onChange={handleCodeChange}
              placeholder="Start coding here..."
              spellCheck={false}
            />
          </div>

          {/* Output Area */}
          <div className="output-area">
            <div className="output-header">
              <span className="output-title">Output</span>
              <button 
                onClick={clearOutput}
                className="clear-output-btn"
              >
                Clear
              </button>
            </div>
            <div className="output-content">
              {output || 'No output yet. Run your code to see results here.'}
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="ide-status-bar">
        <div className="status-left">
          <div className={`status-item ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '● Connected' : '● Disconnected'}
          </div>
          <div className="status-item">
            Python 3.9
          </div>
        </div>
        <div className="status-right">
          <span className="user-count">{users.length} users online</span>
        </div>
      </div>

      {/* New File Dialog */}
      {showNewFileDialog && (
        <div className="file-input-dialog">
          <div className="dialog-content">
            <h3>Create New File</h3>
            <div className="form-group">
              <label>File Name:</label>
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createNewFile()}
                placeholder="example.py"
                autoFocus
              />
            </div>
            <div className="dialog-buttons">
              <button 
                className="dialog-btn secondary"
                onClick={() => setShowNewFileDialog(false)}
              >
                Cancel
              </button>
              <button 
                className="dialog-btn primary"
                onClick={createNewFile}
                disabled={!newFileName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Button */}
      <ChatButton 
        onClick={toggleChat}
        isOpen={isChatOpen}
      />

      {/* Quick Chat */}
      <QuickChat
        roomId={ideId}
        roomType="ide"
        username={username}
        isOpen={isChatOpen}
        onToggle={toggleChat}
      />
    </div>
  );
}

export default IDE;