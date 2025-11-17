import './index.css';
import { createGame } from './game/core/GameLoop';
import { initializeRendering } from './graphics/rendering/Renderer';

// Initialize the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 BiesyDefence starting...');
  
  try {
    // Initialize Three.js rendering
    const renderer = initializeRendering();
    
    // Create and start the game
    const game = createGame(renderer);
    game.start();
    
    console.log('🎮 Game initialized successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize game:', error);
    document.getElementById('app')!.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column; color: white;">
        <h1>❌ Game Initialization Failed</h1>
        <p>Please check the console for more details.</p>
        <p><small>Error: ${error}</small></p>
      </div>
    `;
  }
});