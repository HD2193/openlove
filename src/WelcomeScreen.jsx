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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-start pt-12 pb-8 px-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#FF4B4B' }}
          >
            <Heart className="w-5 h-5 text-white" strokeWidth={2.5} fill="none" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#FF4B4B' }}>OpenLove</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Hero Section */}
        <div className="p-6 mb-8" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 227, 227, 0.8) 30%, rgba(255, 255, 255, 0.7) 70%, rgba(255, 227, 227, 0.6) 100%)', backdropFilter: 'blur(10px)' }}>
          {/* Text and Image Layout */}
          <div className="flex items-start justify-between">
            {/* Left Text */}
            <div className="flex-1 pr-4">
              <h2 className="text-xl font-semibold mb-2" style={{ color: '#982323' }}>
                Love is complicated,<br />let's figure it out together.
              </h2>
              <p className="text-sm mb-6" style={{ color: '#982323' }}>
                Ask anything – whether you're dating, navigating love, or<br />
                healing after heartbreak. Your AI confidante is here 24/7.
              </p>
            </div>

            {/* Right Image */}
            <div className="flex-shrink-0">
              <img src="/2people.png" alt="Two people illustration" className="w-24 h-24 object-contain" />
            </div>
          </div>
          
          {/* Start Chat Button - Left aligned under text */}
          <div className="flex justify-start">
            <button
              onClick={() => setCurrentScreen('chat')}
              className="px-8 py-3 rounded-full font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: '#982323', color: '#FFFFFF' }}
            >
              Start Chat
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mx-auto">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id);
                setCurrentScreen('chat');
              }}
              className="p-4 rounded-2xl cursor-pointer transition-colors hover:opacity-90"
              style={{ backgroundColor: '#FFE3E3' }}
            >
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                {category.title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {category.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;