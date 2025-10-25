import React, { useState, useEffect, useRef } from 'react';
import { sendMessageToAI, testAPI, getSavedContexts, deleteContext } from '../services/aiService';
import './ChatInterface.css';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTypingMessage, setCurrentTypingMessage] = useState(null);
  const [savedContexts, setSavedContexts] = useState([]);
  const [showMemoryPanel, setShowMemoryPanel] = useState(false);

  // For regenerate + tracking last AI answer / user prompt
  const [lastAIMessageId, setLastAIMessageId] = useState(null);
  const [lastUserPrompt, setLastUserPrompt] = useState(null);
  const [showRegenerate, setShowRegenerate] = useState(false);

  // generation control (for stop)
  const generationRef = useRef({
    cancelled: false,
    id: null
  });

  // reference to messages container end for scrolling
  const messagesEndRef = useRef(null);

  useEffect(() => {
    (async () => {
      await testAPI();
      refreshSavedContexts();
    })();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentTypingMessage]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const refreshSavedContexts = () => {
    // original getSavedContexts might be sync — if it's async, this will still work if it returns a Promise
    const maybe = getSavedContexts();
    if (maybe && typeof maybe.then === 'function') {
      maybe.then(ctxs => setSavedContexts(ctxs || []))
           .catch(() => setSavedContexts([]));
    } else {
      setSavedContexts(maybe || []);
    }
  };

  const pushMessage = (text, sender = 'ai') => {
    const message = {
      id: `${sender}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
      text,
      sender,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, message]);
    return message;
  };

  /**
   * typeMessage: typewriter effect with cancellation support
   * - If generationRef.current.cancelled is set while typing, it stops and writes "(stopped)" message.
   */
  const typeMessage = async (fullText, messageId) => {
    let displayedText = '';

    // If cancelled already, set a stopped message and return
    if (generationRef.current.cancelled) {
      setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, text: '(generation stopped)' } : msg));
      setCurrentTypingMessage(null);
      return;
    }

    for (let i = 0; i < fullText.length; i++) {
      // check cancellation between characters
      if (generationRef.current.cancelled) {
        setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, text: displayedText + ' …(stopped)' } : msg));
        setCurrentTypingMessage(null);
        return;
      }

      displayedText += fullText[i];
      setCurrentTypingMessage({
        id: messageId,
        text: displayedText,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      });

      const delay = 8 + Math.random() * 35; // small, faster type
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // replace the placeholder with the full text
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, text: fullText }
        : msg
    ));

    setCurrentTypingMessage(null);
  };

  /**
   * generateThreeWallResponse:
   * - Wall 1: produce initial content
   * - Wall 2: verify & correct duplication/format (basic wrapper prompt)
   * - Wall 3: format for user with headings/numbering/clean output
   *
   * Note: This relies on sendMessageToAI being a synchronous/awaitable call that returns text.
   * We check generationRef.current.cancelled between steps. If cancelled, stop and cleanup.
   */
  const generateThreeWallResponse = async (userPrompt) => {
    // Setup cancellation token for this generation
    const genId = `gen_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
    generationRef.current = { cancelled: false, id: genId };

    setIsLoading(true);
    setShowRegenerate(false);

    // Push placeholder AI message and keep its id for typing
    const placeholder = pushMessage('', 'ai');

    try {
      // Wall 1: generate
      const step1Prompt = userPrompt;
      const resp1 = await sendMessageToAI(step1Prompt);
      if (generationRef.current.cancelled) {
        // If cancelled mid-way, mark placeholder accordingly
        setMessages(prev => prev.map(m => m.id === placeholder.id ? { ...m, text: '(generation stopped)' } : m));
        setIsLoading(false);
        setCurrentTypingMessage(null);
        return;
      }

      // Wall 2: verify & correct duplicates / stray bullets / leading asterisks
      // We craft a verification prompt: ask AI to remove stray characters and validate the content.
      const step2Prompt = `Please check the following AI response for accuracy, remove any leading stray characters (like "*" or "-" if used incorrectly), remove duplicates, shorten redundancies and correct language issues. Then produce a corrected version ONLY:\n\n"${resp1}"\n\nIf nothing to correct, just repeat the corrected content.`;
      const resp2 = await sendMessageToAI(step2Prompt);
      if (generationRef.current.cancelled) {
        setMessages(prev => prev.map(m => m.id === placeholder.id ? { ...m, text: '(generation stopped)' } : m));
        setIsLoading(false);
        setCurrentTypingMessage(null);
        return;
      }

      // Wall 3: final formatting for user — headings, numbering, bold, code blocks where needed
      const step3Prompt = `Format the following text for the user. Add headings, numbered steps or bullets when helpful, bold important terms, and make it look clean and professional. Produce only the final formatted content:\n\n"${resp2}"`;
      const resp3 = await sendMessageToAI(step3Prompt);
      if (generationRef.current.cancelled) {
        setMessages(prev => prev.map(m => m.id === placeholder.id ? { ...m, text: '(generation stopped)' } : m));
        setIsLoading(false);
        setCurrentTypingMessage(null);
        return;
      }

      // All walls done — type the final result into placeholder
      await typeMessage(resp3, placeholder.id);

      // Save last AI message id & user prompt for regen
      setLastAIMessageId(placeholder.id);
      setLastUserPrompt(userPrompt);
      setShowRegenerate(true);

      // After full message produced, refresh memories
      refreshSavedContexts();
    } catch (error) {
      // Replace placeholder with an error
      setMessages(prev => prev.map(m => m.id === placeholder.id ? { ...m, text: 'I encountered an error while generating the response. Please try again.' } : m));
      setCurrentTypingMessage(null);
    } finally {
      setIsLoading(false);
      generationRef.current.cancelled = false;
      generationRef.current.id = null;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    pushMessage(userMessage, 'user');
    setInputMessage('');
    setLastUserPrompt(userMessage);

    // start the 3-wall generation
    await generateThreeWallResponse(userMessage);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteContext = (id) => {
    if (window.confirm('Delete this memory?')) {
      deleteContext(id);
      refreshSavedContexts();
      pushMessage('Memory deleted', 'ai');
    }
  };

  const handleClearAllMemories = () => {
    if (window.confirm('Delete all saved memories?')) {
      localStorage.removeItem('ai_memory_contexts');
      refreshSavedContexts();
      pushMessage('All memories cleared', 'ai');
    }
  };

  // Stop current generation (safe)
  const handleStopGeneration = () => {
    if (isLoading || currentTypingMessage) {
      generationRef.current.cancelled = true;
      setIsLoading(false);
      setCurrentTypingMessage(null);
      // optionally push a small system message indicating stop
      pushMessage('(Generation stopped by user)', 'ai');
      setShowRegenerate(lastUserPrompt != null); // allow regenerate even after stop
    }
  };

  // Regenerate last response (re-run pipeline for lastUserPrompt)
  const handleRegenerate = async () => {
    if (!lastUserPrompt) return;
    // small system message
    pushMessage('(Regenerating response...)', 'ai');
    // run generation again
    await generateThreeWallResponse(lastUserPrompt);
  };

  // Toggle memory panel: ensure it fully hides on desktop unless visible
  const toggleMemoryPanel = () => {
    setShowMemoryPanel(prev => !prev);
  };

  return (
    <div className="chat-interface">
      {/* Header */}
      <header className="chat-header">
        <div className="header-container">
          <div className="header-main">
            <div className="logo-section">
              <div className="neural-logo">
                <div className="logo-core">
                  <div className="core-spark"></div>
                </div>
                <div className="logo-orbits">
                  <div className="orbit-ring ring-1"></div>
                  <div className="orbit-ring ring-2"></div>
                </div>
              </div>
              <div className="logo-text">
                <h1>RemoraAI</h1>
                <p className="tagline">Memory-Powered Assistant</p>
              </div>
            </div>
            
            <div className="header-status">
              <div className="status-indicator">
                <div className="status-pulse"></div>
                <span className="status-text">Memory System Active</span>
              </div>
              <div className="memory-counter">
                <span className="counter-number">{savedContexts.length}</span>
                <span className="counter-label">Memories</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="chat-main">
        {/* Memory Panel */}
        <aside className={`memory-sidebar ${showMemoryPanel ? 'visible' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-title">
              <div className="title-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
              </div>
              <h3>Memory Vault</h3>
            </div>
            <button 
              className="close-sidebar"
              onClick={() => setShowMemoryPanel(false)}
              aria-label="Close memory panel"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          
          <div className="memory-stats">
            <div className="stat-item">
              <span className="stat-number">{savedContexts.length}</span>
              <span className="stat-label">Active Memories</span>
            </div>
            {savedContexts.length > 0 && (
              <button 
                onClick={handleClearAllMemories}
                className="clear-all-btn"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                Clear All
              </button>
            )}
          </div>

          <div className="memories-list">
            {savedContexts.length === 0 ? (
              <div className="empty-memories">
                <div className="empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                </div>
                <p>No memories yet</p>
                <small>Use "save" to store information</small>
              </div>
            ) : (
              savedContexts.map(ctx => (
                <div key={ctx.id} className="memory-card">
                  <div className="memory-card-header">
                    <h4>{ctx.name}</h4>
                    <button 
                      onClick={() => handleDeleteContext(ctx.id)}
                      className="delete-memory-btn"
                      aria-label={`Delete memory ${ctx.name}`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                  <p className="memory-content">{ctx.content}</p>
                  <div className="memory-meta">
                    <span>{new Date(ctx.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="memory-glow"></div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Chat Messages Area */}
        <section className="chat-container">
          <div className="chat-controls">
            <button 
              onClick={toggleMemoryPanel}
              className={`memory-toggle-btn ${showMemoryPanel ? 'active' : ''}`}
              aria-pressed={showMemoryPanel}
              aria-label="Toggle memory panel"
            >
              <span className="btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
              </span>
              Memory Vault ({savedContexts.length})
              <div className="btn-glow"></div>
            </button>
          </div>

          <div className="messages-container">
            {messages.length === 0 && (
              <div className="welcome-section">
                <div className="welcome-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                    <polyline points="17 6 23 6 23 12"/>
                  </svg>
                </div>
                <h2>Welcome to RemoraAI</h2>
                <p>I remember everything you save, so you never have to repeat yourself.</p>
                <div className="welcome-tips">
                  <div className="tip-card">
                    <span className="tip-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                      </svg>
                    </span>
                    <p>Use <strong>"save"</strong> or <strong>"remember"</strong> to store information</p>
                  </div>
                  <div className="tip-card">
                    <span className="tip-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                    </span>
                    <p>Mention saved items in your questions for context-aware answers</p>
                  </div>
                </div>
              </div>
            )}

            <div className="messages-list">
              {messages.map(msg => (
                <div key={msg.id} className={`message-bubble ${msg.sender}`}>
                  <div className="bubble-content">
                    <div className="message-text">{msg.text}</div>
                    <div className="message-time">{msg.timestamp}</div>
                  </div>
                  <div className="bubble-glow"></div>
                </div>
              ))}

              {currentTypingMessage && (
                <div className="message-bubble ai typing">
                  <div className="bubble-content">
                    <div className="message-text">
                      {currentTypingMessage.text}
                      <span className="typing-cursor">|</span>
                    </div>
                    <div className="message-time">typing...</div>
                  </div>
                  <div className="bubble-glow"></div>
                </div>
              )}

              {isLoading && !currentTypingMessage && (
                <div className="message-bubble ai loading">
                  <div className="bubble-content">
                    <div className="thinking-animation">
                      <div className="thinking-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <span className="thinking-text">Remora is thinking</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="input-section">
            <div className="input-container">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything or use 'save/remember' to store information..."
                className="message-input"
                disabled={isLoading || currentTypingMessage}
                aria-label="Chat input"
              />

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {/* Stop button: visible while generating or typing */}
                {(isLoading || currentTypingMessage) && (
                  <button
                    onClick={handleStopGeneration}
                    className="stop-button"
                    title="Stop response"
                    aria-label="Stop response"
                  >
                    ⏹
                  </button>
                )}

                <button 
                  onClick={handleSendMessage} 
                  className="send-button" 
                  disabled={isLoading || currentTypingMessage || !inputMessage.trim()}
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <div className="send-loading" aria-hidden="true">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  ) : (
                    <span className="send-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                    </span>
                  )}
                  <div className="send-glow"></div>
                </button>
              </div>
            </div>

            <div className="input-hint">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
              Try: "save I take medicine at 9am" or ask about saved items
            </div>

            {/* Regenerate button (shown below input area, not attached to user bubble) */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
              {showRegenerate && (
                <button 
                  onClick={handleRegenerate}
                  className="regenerate-btn"
                  title="Regenerate last AI response"
                >
                  ⟲ Regenerate
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ChatInterface;
