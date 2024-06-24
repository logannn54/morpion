import React, { useState, useEffect } from 'react';
import Board from './Board'; 

export default function Game() {
  const [gameId, setGameId] = useState(null);
  const [currentSquares, setCurrentSquares] = useState([["", "", ""], ["", "", ""], ["", "", ""]]);
  const [xIsNext, setXIsNext] = useState(true);

  useEffect(() => {
    async function initializeGame() {
      try {
        const { id, state, player } = await fetchGameState(gameId); // Assurez-vous que gameId est défini correctement
        setGameId(id);
        setCurrentSquares(state);
        setXIsNext(player === 'X');
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du jeu :', error);
      }
    }
  
    if (gameId) {
      initializeGame();
    }
  }, [gameId]);
  

  async function handlePlay(nextSquares) {
    try {
      const { state, player } = await makeMove(gameId, nextSquares);
      setCurrentSquares(state);
      setXIsNext(player === 'X');
    } catch (error) {
      console.error('Erreur lors de l\'exécution du coup :', error);
    }
  }
  


  return (
    <div className="game">
      <div className="game-board">
        <Board squares={currentSquares} xIsNext={xIsNext} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        {/* Insérez ici la liste des mouvements si nécessaire */}
      </div>
    </div>
  );
}
