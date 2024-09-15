import React from 'react';

interface GameSelectorProps {
  onSelectGame: (game: 'tictactoe' | 'tetris') => void;
  walletAddress: string | null;
}

const GameSelector: React.FC<GameSelectorProps> = ({ onSelectGame, walletAddress }) => {
  return (
    <div>
      <h2>Sélectionnez un jeu</h2>
      <button onClick={() => onSelectGame('tictactoe')}>Tic Tac Toe</button>
      <button onClick={() => onSelectGame('tetris')}>Tetris</button>
      <p>Wallet connecté : {walletAddress || 'Non connecté'}</p>
    </div>
  );
};

export default GameSelector;