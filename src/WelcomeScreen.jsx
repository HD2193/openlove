import React from 'react';
import { Heart } from 'lucide-react';

const WelcomeScreen = ({ setCurrentScreen, setSelectedCategory }) => {
  const categories = [
    {
      id: 'dating',
      title: 'Dating',
      description: 'Navigate the dating world with Confidence'
    },
    {
      id: 'breakup',
      title: 'Breakup Healing',
      description: 'Heal gently, grow stronger within'
    },
    {
      id: 'romance',
      title: 'Love and Romance',
      description: 'Deepen love, elevate romance'
    },
    {
      id: 'communication',
      title: 'Communication',
      description: 'Express yourself and understand better'
    }
  ];

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex flex-col"
      style={{
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-start pt-12 pb-8 px-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ backgroundColor: '#FF4B4B' }}
          >
            <Heart className="w-5 h-5 text-white" strokeWidth={2.5} fill="none" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#FF4B4B' }}>OpenLove</h1>
        </div>
      </div>

      {/* Hero Section: Full width background */}
      <div
        className="w-full px-4 py-6 mb-8"
        style={{
          background:
            'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 227, 227, 0.8) 30%, rgba(255, 255, 255, 0.7) 70%, rgba(255, 227, 227, 0.6) 100%)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="flex items-start justify-between max-w-md mx-auto">
          {/* Text */}
          <div className="flex-1 pr-4">
            <h2
              className="mb-2"
              style={{
                color: '#982323',
                fontSize: '16px',
                fontFamily: `'Urbanist', sans-serif`,
                fontWeight: 400,
                lineHeight: '1.2',
                letterSpacing: '0.02em',
                maxWidth: '197px',
              }}
            >
              Love is complicated,<br />
              let’s figure it out together.
            </h2>
            <p
              style={{
                color: '#982323',
                fontSize: '14px',
                fontFamily: `'Urbanist', sans-serif`,
                fontWeight: 400,
                lineHeight: '1.4',
                letterSpacing: '0.02em',
                maxWidth: '260px',
              }}
            >
              Ask anything – whether you're dating,<br />
              navigating love, or healing after heartbreak.<br />
              Your AI confidante is here 24/7.
            </p>
          </div>

          {/* Image */}
          <div className="flex-shrink-0">
            <img
              src="/2people.png"
              alt="Two people illustration"
              className="w-24 h-24 object-contain"
            />
          </div>
        </div>

        {/* Button */}
        <div className="flex justify-start max-w-md mx-auto mt-4">
          <button
            onClick={() => setCurrentScreen('chat')}
            className="px-8 py-3 rounded-full font-medium transition-opacity duration-200 hover:opacity-90 active:scale-95"
            style={{ backgroundColor: '#982323', color: '#FFFFFF' }}
          >
            Start Chat
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 gap-4 w-full px-4">
        {categories.map((category) => (
       <div
      key={category.id}
      onClick={() => {
      setSelectedCategory(category.id);
      setCurrentScreen('chat');
     }}
     className="p-4 cursor-pointer transition-transform duration-150 active:scale-95 hover:shadow-md hover:scale-[1.02]"
     style={{
     backgroundColor: '#FFE3E3',
    borderRadius: '1rem', // Matches rounded corners in design
  }}
>
            <h3 className="font-semibold text-sm mb-1" style={{ color: '#982323' }}>
              {category.title}
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: '#A23737' }}>
              {category.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;