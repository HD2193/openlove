import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Heart } from 'lucide-react';

// ========================================
// 🔗 N8N WEBHOOK INTEGRATION SETUP
// ========================================
// Fixed webhook URL (removed trailing space)
const N8N_WEBHOOK_URL = 'https://vishp.app.n8n.cloud/webhook/39681a43-2925-40e7-8c54-24fa9397ad48/chat';

// Enhanced API Configuration
const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  timeout: 45000 // Increased timeout to 45 seconds
};

// ========================================
// 🎨 TEXT FORMATTING UTILITIES
// ========================================
/**
 * Parse text and convert **text** to bold formatting
 * @param {string} text - The text to parse
 * @returns {JSX.Element} - Formatted text with bold elements
 */
const parseTextWithBold = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  // Split text by **bold** pattern while preserving the delimiters
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  
  return parts.map((part, index) => {
    // Check if this part is a **bold** section
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      // Remove the ** markers and render as bold
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-semibold">
          {boldText}
        </strong>
      );
    }
    // Regular text - preserve line breaks
    return part.split('\n').map((line, lineIndex) => (
      <span key={`${index}-${lineIndex}`}>
        {line}
        {lineIndex < part.split('\n').length - 1 && <br />}
      </span>
    ));
  });
};

/**
 * Alternative parsing function for more complex markdown-like formatting
 * Supports **bold**, *italic*, and preserves line breaks
 * @param {string} text - The text to parse
 * @returns {JSX.Element} - Formatted text with styling
 */
const parseMarkdownText = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  // Split by multiple patterns: **bold**, *italic*, and line breaks
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\n)/g);
  
  return parts.map((part, index) => {
    // Bold text **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-semibold">
          {boldText}
        </strong>
      );
    }
    // Italic text *text*
    else if (part.startsWith('*') && part.endsWith('*') && part.length > 2 && !part.includes('**')) {
      const italicText = part.slice(1, -1);
      return (
        <em key={index} className="italic">
          {italicText}
        </em>
      );
    }
    // Line breaks
    else if (part === '\n') {
      return <br key={index} />;
    }
    // Regular text
    else {
      return <span key={index}>{part}</span>;
    }
  });
};

const ChatScreen = ({ selectedCategory, setCurrentScreen }) => {
  const [chatInput, setChatInput] = useState('');
  const [currentSuggestion, setCurrentSuggestion] = useState('');
  const [fullSuggestion, setFullSuggestion] = useState('');
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  
  // ========================================
  // 🤖 AI CHAT STATE MANAGEMENT
  // ========================================
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hi there! I'm OpenLove AI.\nHow can I help you today?",
      timestamp: new Date()
    }
  ]);
 
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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
  // 🚀 ENHANCED N8N API INTEGRATION FUNCTIONS
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

      console.log('🔍 Sending message to N8N webhook...');

      // Enhanced payload structure that matches n8n chat trigger expectations
      const payload = {
        chatInput: userMessage,
        sessionId: `session_${Date.now()}`,
        action: 'sendMessage',
        message: userMessage,
        category: category || 'general',
        timestamp: new Date().toISOString(),
        metadata: {
          userAgent: navigator.userAgent,
          origin: window.location.origin
        }
      };

      console.log('🚀 Sending payload to n8n:', payload);

      // Multiple request strategies to handle CORS issues
      let response;

      try {
        response = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      
        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      } catch (err) {
        console.error('❌ Fetch failed:', err);
        throw err;
      }
      
      // Handle different response scenarios
      let data;
      let aiResponse = '';

      try {
        // First, try to get response text
        const responseText = await response.text();
        console.log('📦 Raw response:', responseText);

        // If response is empty but status is ok, return a default message
        if (!responseText && response.ok) {
          return "I received your message! However, I'm getting an empty response from the AI service. Please try asking your question again.";
        }

        // Try to parse as JSON
        if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.warn('Failed to parse JSON, treating as plain text:', parseError);
            data = responseText;
          }
        } else {
          data = responseText;
        }

      } catch (textError) {
        console.error('Failed to get response text:', textError);
        throw new Error('Failed to read response from webhook');
      }

      console.log('✅ Processed N8N response:', data);

      // Extract AI response from various possible response formats
      if (typeof data === 'string') {
        aiResponse = data.trim();
      } else if (data && typeof data === 'object') {
        // Try various common response field names
        aiResponse = data.output || 
                    data.response || 
                    data.message || 
                    data.ai_response || 
                    data.text || 
                    data.answer || 
                    data.reply || 
                    data.result ||
                    data.content ||
                    data.data ||
                    '';
                    
        // Handle nested response structures
        if (!aiResponse && data.body) {
          if (typeof data.body === 'string') {
            aiResponse = data.body;
          } else if (data.body.response || data.body.message) {
            aiResponse = data.body.response || data.body.message;
          }
        }
                    
        // If it's an array, try to get the first meaningful item
        if (Array.isArray(data) && data.length > 0) {
          const firstItem = data[0];
          if (typeof firstItem === 'string') {
            aiResponse = firstItem;
          } else if (firstItem && typeof firstItem === 'object') {
            aiResponse = firstItem.response || 
                       firstItem.message || 
                       firstItem.text || 
                       firstItem.content || 
                       firstItem.output ||
                       '';
          }
        }
        
        // If still no response and we have data, try to extract meaningful content
        if (!aiResponse && data) {
          // Look for any string values in the object
          const stringValues = Object.values(data).filter(val => 
            typeof val === 'string' && val.trim().length > 0
          );
          if (stringValues.length > 0) {
            aiResponse = stringValues[0];
          }
        }
      }
      
      // Clean up the response
      if (aiResponse) {
        // Remove JSON artifacts if present
        aiResponse = aiResponse.replace(/^["']|["']$/g, ''); // Remove quotes
        aiResponse = aiResponse.replace(/\\n/g, '\n'); // Convert escaped newlines
        aiResponse = aiResponse.replace(/\\t/g, ' '); // Convert escaped tabs
        aiResponse = aiResponse.replace(/\\\//g, '/'); // Convert escaped slashes
        aiResponse = aiResponse.trim();
        
        if (aiResponse && aiResponse.length > 0) {
          return aiResponse;
        }
      }
      
      // If we couldn't extract a meaningful response but got a successful status
      if (response.ok) {
        return "I received your message successfully, but I'm having trouble processing the response right now. Could you please try rephrasing your question?";
      }
      
      // If response wasn't ok, throw an error
      throw new Error(`Webhook returned status ${response.status}: ${response.statusText}`);

    } catch (error) {
      console.error('❌ N8N integration error:', error);
      
      let errorMessage = 'I apologize, but I\'m having trouble connecting to the AI service right now. ';
      
      if (error.name === 'AbortError') {
        errorMessage += 'The request timed out. Please try again with a shorter message.';
      } else if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
        errorMessage += 'Please check your internet connection and try again.';
      } else if (error.message.includes('CORS')) {
        errorMessage += 'There\'s a connection security issue. The webhook may need to be reconfigured for CORS.';
      } else if (error.message.includes('500')) {
        errorMessage += 'The AI service is temporarily unavailable. Please try again in a moment.';
      } else if (error.message.includes('404')) {
        errorMessage += 'The AI service endpoint could not be found. The webhook URL may be incorrect.';
      } else if (error.message.includes('403') || error.message.includes('401')) {
        errorMessage += 'Access to the AI service was denied. The webhook may need authentication setup.';
      } else {
        errorMessage += 'Please try asking your question again in a moment.';
      }
      
      // Don't set error in state - just return the message so chat continues to work
      return errorMessage;
      
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

    // Add user message to chat immediately
    const userMessage = {
      id: `user_${Date.now()}_${Math.random()}`,
      type: 'user',
      content: message.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Add loading message
    setTimeout(() => {
      setMessages(prev => [...prev, { id: 'loading-' + Date.now(), type: 'loading' }]);
    }, 100);

    setChatInput('');
    setCurrentSuggestion('');
    setFullSuggestion('');

    // 🤖 SEND TO N8N AND GET AI RESPONSE
    try {
      const aiResponse = await sendToN8N(message.trim());

      // Add AI response to chat
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => {
        // Remove loading message and add AI response
        const withoutLoading = prev.filter(msg => msg.type !== 'loading');
        return [...withoutLoading, aiMessage];
      });
      
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      
      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm sorry, I encountered an unexpected error. Please try sending your message again.",
        timestamp: new Date()
      };

      setMessages(prev => {
        // Remove loading message and add error response
        const withoutLoading = prev.filter(msg => msg.type !== 'loading');
        return [...withoutLoading, errorMessage];
      });
    }
  };

  // Fixed auto-scroll logic - only scroll when AI responds
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    
    // Only auto-scroll when:
    // 1. It's an AI message (not user message)
    // 2. It's a loading message
    // 3. The user hasn't manually scrolled up
    if (shouldAutoScroll && (lastMessage?.type === 'ai' || lastMessage?.type === 'loading')) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, shouldAutoScroll]);

  // Enhanced scroll detection
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    let scrollTimeout;
    
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      
      // User is scrolling manually
      setIsUserScrolling(true);
      setShouldAutoScroll(isNearBottom);
      
      // Reset scrolling state after user stops scrolling
      scrollTimeout = setTimeout(() => {
        setIsUserScrolling(false);
      }, 1000);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

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

  // iOS zoom prevention - handle input focus
  const handleInputFocus = (e) => {
    // Prevent viewport zoom on iOS by scrolling the input into view
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      setTimeout(() => {
        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
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

      {/* Chat Messages Area - FIXED STRUCTURE */}
      <div 
       ref={chatContainerRef}
       className="flex-1 pt-24 pb-32 px-4 overflow-y-auto flex flex-col justify-end"
       style={{ scrollBehavior: 'smooth' }}
       >
        <div className="w-full space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex w-full ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-2`}
            >
              {message.type === 'ai' && (
                <div className="flex items-end gap-3 max-w-xs">
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
                  
                  {/* AI Message Bubble with Bold Text Support */}
                  <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                    <div className="text-sm leading-relaxed" style={{ color: '#730505' }}>
                      {parseTextWithBold(message.content)}
                    </div>
                  </div>
                </div>
              )}

              {message.type === 'loading' && (
                <div className="flex items-end gap-3 max-w-xs">
                  {/* AI Avatar */}
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
                  
                  {/* Loading Message Bubble */}
                  <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              {message.type === 'user' && (
              <div className="flex justify-end items-end max-w-xs ml-auto">
              <div className="rounded-2xl rounded-tr-sm px-5 py-4 shadow-sm" style={{ backgroundColor: '#FFD6D6' }}>
             <p className="text-sm leading-relaxed" style={{ color: '#982323' }}>
            {message.content}
             </p>
             </div>
           </div>
           )}
         </div>
        ))}
          
          {/* Error message - Only show if there's a current error */}
          {error && (
            <div className="flex justify-start w-full mb-2">
              <div className="flex items-start gap-3 max-w-xs">
                {/* AI Avatar */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FF6B6B' }}>
                  <Heart className="w-5 h-5 text-white" fill="currentColor" />
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
                    onFocus={handleInputFocus}
                    onKeyDown={(e) => {
                      handleTabCompletion(e);
                      // Send message on Enter key
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(chatInput);
                      }
                    }}
                    placeholder="Ask for relationship advice..."
                    className="ios-input-fix w-full outline-none bg-transparent relative z-20 text-sm"
                    style={{ 
                      color: '#8A8A8A',
                      caretColor: '#8A8A8A',
                      fontSize: '16px', // Critical: 16px prevents zoom on iOS
                      lineHeight: '1.2',
                      background: 'transparent',
                      WebkitAppearance: 'none',
                      WebkitBorderRadius: '0',
                      border: 'none',
                      outline: 'none',
                      boxShadow: 'none',
                      WebkitBoxShadow: 'none',
                      MozAppearance: 'textfield',
                      WebkitTextSizeAdjust: '100%',
                      textSizeAdjust: '100%',
                      WebkitUserSelect: 'text',
                      userSelect: 'text',
                      WebkitTouchCallout: 'default',
                      WebkitTapHighlightColor: 'transparent'
                    }}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    inputMode="text"
                    disabled={isLoading}
                  />
                  
                  {/* Email-style inline suggestion overlay - Now clickable on mobile */}
                  {currentSuggestion && chatInput.trim() && (
                    <div 
                      className="absolute top-0 left-0 z-10 select-none cursor-pointer"
                      style={{ 
                        fontSize: '16px', // Match input font size exactly
                        lineHeight: '1.2', // Match input line height
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

      {/* Enhanced iOS zoom prevention styles */}
      <style jsx>{`
        .ios-input-fix {
          /* Critical iOS zoom prevention rules */
          font-size: 16px !important;
          -webkit-text-size-adjust: 100% !important;
          -webkit-appearance: none !important;
          -webkit-border-radius: 0 !important;
          border-radius: 0 !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          -webkit-box-shadow: none !important;
          background-clip: padding-box !important;
          -webkit-background-clip: padding-box !important;
        }
        
        /* Additional iOS specific fixes */
        @supports (-webkit-touch-callout: none) {
          .ios-input-fix {
            font-size: 16px !important;
            transform: translateZ(0) !important;
            -webkit-transform: translateZ(0) !important;
          }
        }
        
        /* Prevent zoom on focus for all iOS devices */
        @media screen and (max-device-width: 768px) and (-webkit-min-device-pixel-ratio: 1) {
          .ios-input-fix {
            font-size: 16px !important;
            -webkit-text-size-adjust: none !important;
            text-size-adjust: none !important;
          }
        }
        
        /* iPhone specific */
        @media only screen and (max-device-width: 480px) and (-webkit-min-device-pixel-ratio: 2) {
          .ios-input-fix {
            font-size: 16px !important;
          }
        }
        
        /* iPad specific */
        @media only screen and (max-device-width: 1024px) and (-webkit-min-device-pixel-ratio: 1) {
          .ios-input-fix {
            font-size: 16px !important;
          }
        }
        
        /* Remove input styling that might trigger zoom */
        input[type="text"].ios-input-fix:focus {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
          -webkit-box-shadow: none !important;
          -webkit-appearance: none !important;
          zoom: 1 !important;
          -webkit-transform: translateZ(0) !important;
          transform: translateZ(0) !important;
        }
      `}</style>
    </div>
  );
};

export default ChatScreen;