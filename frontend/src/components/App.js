import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import LandingPage from './LandingPage';
import WhiteboardPage from './WhiteboardPage';
import ChatPage from './ChatPage';
import Chat from './Chat';
import IDEPage from './IDEPage';
import IDE from './IDE';
import '../styles/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/whiteboard" element={<WhiteboardPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:chatId" element={<Chat />} />
          <Route path="/ide" element={<IDEPage />} />
          <Route path="/ide/:ideId" element={<IDE />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
