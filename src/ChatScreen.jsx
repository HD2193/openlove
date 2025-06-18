
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
  const [fullSuggestion, setFullSuggestion] = useState('');
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
    setFullSuggestion('');

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
        setFullSuggestion(bestMatch);
      } else {
        setCurrentSuggestion('');
        setFullSuggestion('');
      }
    } else {
      setCurrentSuggestion('');
      setFullSuggestion('');
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
      setFullSuggestion('');
    }
  };

  // Mobile-friendly suggestion tap handler
  const handleSuggestionTap = () => {
    if (fullSuggestion) {
      setChatInput(fullSuggestion);
      setCurrentSuggestion('');
      setFullSuggestion('');
      // Keep focus on input after suggestion tap
      if (inputRef.current) {
        setTimeout(() => {
          inputRef.current.focus();
        }, 0);
      }
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
      <div className="flex-1 pt-24 pb-32 px-4 overflow-y-auto flex flex-col-reverse items-start">
        <div className="w-full space-y-6 flex flex-col-reverse items-start">
          {[...messages].reverse().map((message) => (
            <div
              key={message.id}
              className={`flex w-full ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-2`}
            >
              {message.type === 'ai' && (
                <div className="flex items-start gap-3 max-w-xs">
                  {/* Custom AI Avatar */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FF4B4B' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path 
                        d="M12 3C7.031 3 3 6.805 3 11.25C3 13.448 4.016 15.443 5.635 16.856L5 21L9.204 19.08C10.093 19.36 11.025 19.5 12 19.5C16.969 19.5 21 15.694 21 11.25C21 6.805 16.969 3 12 3Z"
                        stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      />
                      <path 
                        d="M12 9.5C11.7 8.9 11 8.5 10.25 8.5C9.01 8.5 8 9.51 8 10.75C8 12.5 10 13.75 12 15C14 13.75 16 12.5 16 10.75C16 9.51 14.99 8.5 13.75 8.5C13 8.5 12.3 8.9 12 9.5Z"
                        fill="white"
                      />
                    </svg>
                  </div>
                  
                  {/* AI Message Bubble */}
                  <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                    <p className="text-sm leading-relaxed" style={{ color: '#730505' }}>
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
                <div className="flex justify-end max-w-xs ml-auto">
                  <div className="rounded-2xl rounded-tr-sm px-5 py-4 shadow-sm" style={{ backgroundColor: '#FFD6D6' }}>
                    <p className="text-sm leading-relaxed" style={{ color: '#982323' }}>
                      {message.content}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Loading indicator for n8n response */}
          {isLoading && (
            <div className="flex justify-start w-full mb-2">
              <div className="flex items-start gap-3 max-w-xs">
                {/* AI Avatar */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FF6B6B' }}>
                  <Heart className="w-5 h-5 text-white fill-white" />
                </div>
                {/* Loading Bubble */}
                <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
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
            <div className="flex justify-start w-full mb-2">
              <div className="flex items-start gap-3 max-w-xs">
                {/* AI Avatar */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FF6B6B' }}>
                  <Heart className="w-5 h-5 text-white fill-white" />
                </div>
                {/* Error Bubble */}
                <div className="bg-red-100 border border-red-300 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                  <p className="text-sm" style={{ color: '#730505' }}>{error}</p>
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
            <div className="rounded-2xl px-4 py-4 shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
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
                    className="w-full outline-none bg-transparent relative z-20 text-sm"
                    style={{ 
                      color: '#8A8A8A',
                      caretColor: '#8A8A8A',
                      fontSize: '16px', // Prevents zoom on iOS
                      lineHeight: '20px', 
                      background: 'transparent',
                      WebkitAppearance: 'none', // Removes default styling on iOS
                      borderRadius: '0', // Prevents rounded corners on iOS
                      transform: 'translateZ(0)' // Forces hardware acceleration to prevent zoom
                    }}
                    autoComplete="off"
                    spellCheck="false"
                  />
                  
                  {/* Email-style inline suggestion overlay - Now clickable on mobile */}
                  {currentSuggestion && chatInput.trim() && (
                    <div 
                      className="absolute top-0 left-0 z-10 select-none cursor-pointer"
                      style={{ 
                        fontSize: '16px', // Match input font size
                        lineHeight: '20px',
                        fontFamily: 'inherit',
                        color: 'transparent',
                        pointerEvents: 'auto' // Enable touch events
                      }}
                      onClick={handleSuggestionTap}
                      onTouchEnd={handleSuggestionTap} // Better mobile support
                    >
                      <span style={{ color: 'transparent' }}>{chatInput}</span>
                      <span style={{ color: '#9CA3AF', opacity: 0.7 }}>{currentSuggestion}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleSendMessage(chatInput)}
                  disabled={isLoading || !chatInput.trim()}
                  className="p-2 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#FFDEDE' }}
                >
                  <Send className="w-4 h-4" style={{ color: '#982323' }} />
                </button>
              </div>
            </div>
            {currentSuggestion && chatInput.trim() && (
              <p className="text-xs text-gray-500 mt-2 px-4">
                Tap on suggestion to complete • Press Tab on desktop
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Add viewport meta tag styles to prevent zoom */}
      <style jsx>{`
        @media screen and (max-width: 768px) {
          input[type="text"] {
            font-size: 16px !important;
            -webkit-text-size-adjust: 100%;
            -webkit-appearance: none;
            -webkit-border-radius: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatScreen;