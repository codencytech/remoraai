// aiService.js - With Memory System
import { GoogleGenAI } from "@google/genai";

const API_KEY = "AIzaSyAfpF6BFrra-TvTFPFMFwJrGouqdJWQvho";
const ai = new GoogleGenAI({ apiKey: API_KEY });

console.log('Google GenAI SDK initialized - With Memory System');

// Storage keys
const STORAGE_KEY = 'ai_memory_contexts';
const SAVE_KEYWORDS = ['save', 'remember', 'store'];

// Memory system functions
const loadAllContexts = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load contexts:', e);
    return [];
  }
};

const saveAllContexts = (contexts) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contexts));
  } catch (e) {
    console.error('Failed to save contexts:', e);
  }
};

const uid = () => 'ctx_' + Math.random().toString(36).slice(2, 11);
const now = () => Date.now();

// Check if message contains save keyword
const containsSaveKeyword = (message) => {
  if (!message || typeof message !== 'string') return false;
  const lower = message.toLowerCase();
  return SAVE_KEYWORDS.some(k => new RegExp(`\\b${k}\\b`, 'i').test(lower));
};

// Extract content after save keyword
const extractSaveContent = (message) => {
  if (!message) return '';
  const pattern = new RegExp(`\\b(${SAVE_KEYWORDS.join('|')})\\b[:\\-–—\\s]*(.+)`, 'i');
  const match = message.match(pattern);
  return match ? match[2].trim() : message;
};

// Find matching contexts based on keywords in user message
const findMatchingContexts = (userMessage) => {
  if (!userMessage || typeof userMessage !== 'string') return [];
  
  const contexts = loadAllContexts();
  const lowerMessage = userMessage.toLowerCase();
  
  return contexts.filter(ctx => {
    // Check if message contains any words from context name or description
    const searchText = (ctx.name + ' ' + ctx.content).toLowerCase();
    const words = searchText.split(/\s+/).filter(word => word.length > 3);
    
    return words.some(word => lowerMessage.includes(word));
  });
};

// Export memory functions
export const getSavedContexts = () => {
  const contexts = loadAllContexts();
  return contexts.sort((a, b) => b.updatedAt - a.updatedAt);
};

export const saveContext = (content) => {
  const contexts = loadAllContexts();
  
  // Create a short name from first few words
  const words = content.split(/\s+/).slice(0, 4);
  const name = words.join(' ') + (words.length < content.split(/\s+/).length ? '...' : '');
  
  const newContext = {
    id: uid(),
    name: name,
    content: content,
    createdAt: now(),
    updatedAt: now()
  };
  
  contexts.push(newContext);
  saveAllContexts(contexts);
  return newContext;
};

export const deleteContext = (id) => {
  const contexts = loadAllContexts();
  const filtered = contexts.filter(ctx => ctx.id !== id);
  saveAllContexts(filtered);
  return filtered;
};

// Test API (unchanged)
export const testAPI = async () => {
  console.log('Testing Gemini 2.5 Flash...');
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello, respond with just one word: OK",
    });

    let text = response.text || 'No response';
    console.log('Gemini Test Response:', text);
    return { success: true, data: text };
  } catch (error) {
    console.error('Gemini Test Error:', error);
    return { success: false, error: error.message };
  }
};

// Enhanced sendMessageToAI with memory system
export const sendMessageToAI = async (message) => {
  try {
    console.log('Sending message to AI:', message);

    // Check if this is a save command
    if (containsSaveKeyword(message)) {
      const content = extractSaveContent(message);
      if (content) {
        const saved = saveContext(content);
        return `✅ I've saved: "${saved.name}"\nI'll remember this for future conversations.`;
      }
    }

    // Check for matching contexts in user message
    const matchingContexts = findMatchingContexts(message);
    
    let finalPrompt = message;
    let usedContext = null;

    if (matchingContexts.length > 0) {
      // Use the most relevant context (latest updated)
      usedContext = matchingContexts.sort((a, b) => b.updatedAt - a.updatedAt)[0];
      finalPrompt = `Based on this saved information: "${usedContext.content}"\n\nPlease answer this question: ${message}`;
      console.log('Using context:', usedContext.name);
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: finalPrompt,
      config: {
        maxOutputTokens: 4000,
        temperature: 0.7,
      },
    });

    let responseText = response.text || '';

    if (!responseText || responseText.trim() === '') {
      if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
        responseText = response.candidates[0].content.parts[0].text;
      } else {
        responseText = "I understand your question. Let me think about that and provide you with a helpful response.";
      }
    }

    // Add context indicator if used
    if (usedContext) {
      responseText = `🔍 Using: "${usedContext.name}"\n\n${responseText}`;
    }

    console.log('Response with context:', usedContext ? 'Yes' : 'No');
    return responseText;
  } catch (error) {
    console.error('Gemini Service Error:', error);
    return "I'm here to help! Please try your question again.";
  }
};