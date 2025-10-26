import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import ChatInterface from './components/ChatInterface';
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/chat" element={<ChatInterface />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
    </Router>
  );
}

export default App;