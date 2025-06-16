import React, { useState } from 'react';
import WelcomeScreen from './WelcomeScreen';
import ChatScreen from './ChatScreen';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [selectedCategory, setSelectedCategory] = useState('');

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {currentScreen === 'welcome' && (
        <WelcomeScreen 
          setCurrentScreen={setCurrentScreen}
          setSelectedCategory={setSelectedCategory}
        />
      )}
      {currentScreen === 'chat' && (
        <ChatScreen 
          selectedCategory={selectedCategory}
          setCurrentScreen={setCurrentScreen}
        />
      )}
    </div>
  );
};

export default App;