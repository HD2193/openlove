import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Heart } from 'lucide-react';

// ========================================
// 🔗 N8N WEBHOOK INTEGRATION SETUP
// ========================================
// Replace this URL with your n8n webhook URL
const N8N_WEBHOOK_URL = 'https://your-n8n-instance.com/webhook/openlove-ai';

// API Configuration for n8n integration
const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
    // Add any authentication headers your n8n webhook requires
    // 'Authorization': 'Bearer your-token-here',
    // 'X-API-Key': 'your-api-key-here'
  },
  timeout: 30000 // 30 second timeout
};

const ChatScreen = ({ selectedCategory, setCurrentScreen }) => {
  const [chatInput, setChatInput] = useState('');
  const [currentSuggestion, setCurrentSuggestion] = useState('');
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  // ========================================
  // 🤖 AI CHAT STATE MANAGEMENT
  // ========================================
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hi there ! I'm OpenLove AI.\nHow can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Predefined questions for auto-suggestions
  const questionDatabase = [
    "How can I tell if they're really into me?",
    "Tips for a great first date?",
    "We've been arguing a lot - what can we do?",
    "How can I tell if they're really into me romantically?",
    "How do I talk about boundaries in relationships?",
    "What are the red flags that I should watch for?",
    "How to navigate the dating world with confidence?",
    "How to heal gently and grow stronger within yourself?",
    "How to deepen love and elevate romance in relationships?",
    "How to express yourself and understand better in communication?",
    "What should I do when we keep having the same arguments?",
    "How do I know if someone is genuinely interested in me?",
    "What are some conversation starters for first dates?",
    "How to maintain healthy boundaries while dating?",
    "Signs that someone is emotionally unavailable?",
    "How to build trust after a breakup?",
    "What to do when you feel like you're not ready to date?",
    "How to handle rejection gracefully?",
    "Tips for long-distance relationships?",
    "How to know when to end a relationship?"
  ];

  // ========================================
  // 🚀 NAVIGATION HANDLERS
  // ========================================
  const handleBack = () => {
    setCurrentScreen('welcome');
  };

  // ========================================
  // 🚀 N8N API INTEGRATION FUNCTIONS
  // ========================================
  
  /**
   * Send message to n8n webhook and get AI response
   * @param {string} userMessage - The user's message
   * @param {string} category - Selected category (dating, breakup, romance, communication)
   * @returns {Promise<string>} - AI response from n8n
   */
  const sendToN8N = async (userMessage, category = selectedCategory) => {
    try {
      setIsLoading(true);
      setError(null);

      // Prepare payload for n8n webhook
      const payload = {
        message: userMessage,
        category: category,
        conversation_id: `openlove_${Date.now()}`, // Unique conversation ID
        user_id: 'user_123', // Replace with actual user ID if you have user authentication
        timestamp: new Date().toISOString(),
        // Add any additional context your n8n workflow needs
        context: {
          previous_messages: messages.slice(-5), // Send last 5 messages for context
          session_data: {
            selected_category: selectedCategory,
            screen: 'chat'
          }
        }
      };

      console.log('🚀 Sending to n8n:', payload);

      // 🔗 MAIN N8N WEBHOOK CALL - REPLACE URL BELOW
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: API_CONFIG.headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`n8n webhook failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ n8n response:', data);

      // Extract AI response from n8n return data
      // Adjust this based on your n8n workflow response structure
      const aiResponse = data.response || data.message || data.ai_response || 'Sorry, I couldn\'t process that right now.';
      
      return aiResponse;

    } catch (error) {
      console.error('❌ n8n integration error:', error);
      setError('Sorry, I\'m having trouble connecting right now. Please try again.');
      
      // Fallback response if n8n fails
      return 'I apologize, but I\'m experiencing some technical difficulties. Please try asking your question again in a moment.';
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle sending a message (user input)
   * @param {string} message - The message to send
   */
  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setCurrentSuggestion('');

    // 🤖 SEND TO N8N AND GET AI RESPONSE
    const aiResponse = await sendToN8N(message);

    // Add AI response to chat
    const aiMessage = {
      id: Date.now() + 1,
      type: 'ai',
      content: aiResponse,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-suggestion logic with email-style completion
  useEffect(() => {
    if (chatInput.length >= 1) {
      const inputLower = chatInput.toLowerCase().trim();
      const matches = questionDatabase.filter(question =>
        question.toLowerCase().startsWith(inputLower)
      );
      
      if (matches.length > 0) {
        const bestMatch = matches[0];
        const suggestion = bestMatch.substring(chatInput.length);
        setCurrentSuggestion(suggestion);
      } else {
        setCurrentSuggestion('');
      }
    } else {
      setCurrentSuggestion('');
    }
  }, [chatInput]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setChatInput(value);
    
    // Keep focus on input
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 0);
    }
  };

  const handleTabCompletion = (e) => {
    if (e.key === 'Tab' && currentSuggestion) {
      e.preventDefault();
      setChatInput(chatInput + currentSuggestion);
      setCurrentSuggestion('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative" style={{ backgroundColor: '#FFF6F3' }}>
      {/* Header with Back Button */}
      <div className="absolute top-12 left-4 z-10">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-black/5 rounded transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 pt-24 pb-32 px-4 overflow-y-auto">
        <div className="max-w-sm mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'ai' && (
                <div className="flex items-start gap-3 max-w-xs">
                  {/* AI Avatar - WhatsApp style with heart */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FF6B6B' }}>
                    <Heart className="w-5 h-5 text-white fill-white" />
                  </div>
                  {/* AI Message Bubble */}
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <p className="text-gray-800 text-sm leading-relaxed">
                      {message.content.split('\n').map((line, index) => (
                        <span key={index}>
                          {line}
                          {index < message.content.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              )}
              
              {message.type === 'user' && (
                <div className="rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm max-w-xs" style={{ backgroundColor: '#FF6B6B' }}>
                  <p className="text-white text-sm leading-relaxed">
                    {message.content}
                  </p>
                </div>
              )}
            </div>
          ))}
          
          {/* Loading indicator for n8n response */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-3 max-w-xs">
                {/* AI Avatar */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FF6B6B' }}>
                  <Heart className="w-5 h-5 text-white fill-white" />
                </div>
                {/* Loading Bubble */}
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex justify-start">
              <div className="flex items-start gap-3 max-w-xs">
                {/* AI Avatar */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FF6B6B' }}>
                  <Heart className="w-5 h-5 text-white fill-white" />
                </div>
                {/* Error Bubble */}
                <div className="bg-red-100 border border-red-300 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Input Area at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-6" style={{ backgroundColor: '#FFF6F3' }}>
        <div className="max-w-sm mx-auto">
          <div className="relative">
            <div className="rounded-2xl px-4 py-4 shadow-sm" style={{ backgroundColor: '#FFEAE3' }}>
              <div className="flex items-center gap-3">
                <div className="flex-1 relative" style={{ minHeight: '20px' }}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={chatInput}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      handleTabCompletion(e);
                      // Send message on Enter key
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(chatInput);
                      }
                    }}
                    placeholder="Ask for relationship advice..."
                    className="w-full outline-none text-gray-700 placeholder-gray-500 bg-transparent relative z-20 caret-gray-700 text-sm"
                    style={{ fontSize: '14px', lineHeight: '20px', background: 'transparent' }}
                    autoComplete="off"
                    spellCheck="false"
                  />
                  
                  {/* Email-style inline suggestion overlay */}
                  {currentSuggestion && chatInput.trim() && (
                    <div 
                      className="absolute top-0 left-0 pointer-events-none z-10 select-none"
                      style={{ 
                        fontSize: '14px', 
                        lineHeight: '20px',
                        fontFamily: 'inherit',
                        color: 'transparent'
                      }}
                    >
                      <span style={{ color: 'transparent' }}>{chatInput}</span><span style={{ color: '#9CA3AF', opacity: 0.7 }}>{currentSuggestion}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleSendMessage(chatInput)}
                  disabled={isLoading || !chatInput.trim()}
                  className="p-2 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#FF6B6B' }}
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            {currentSuggestion && chatInput.trim() && (
              <p className="text-xs text-gray-500 mt-2 px-4">
                Press Tab to complete
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;