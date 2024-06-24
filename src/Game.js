import React, { useState, useEffect } from 'react';
import Board from './Board';


function Game() {
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentStep, setCurrentStep] = useState(0);
  const [xIsNext, setXIsNext] = useState(true);
  const [gameId, setGameId] = useState(null);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = async () => {
    setGamesPlayed(gamesPlayed + 1);
    const response = await fetch('http://localhost:3000/api/games', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    setGameId(data.id);
    setHistory([Array(9).fill(null)]);
    setCurrentStep(0);
    setXIsNext(true);
  };



  const handleClick = async (i) => {
    if (calculateWinner(history[currentStep]) || history[currentStep][i]) {
      return;
    }

    const newSquares = [...history[currentStep]];
    newSquares[i] = xIsNext ? 'X' : 'O';

    const response = await fetch(`http://localhost:3000/api/games/${gameId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        state: newSquares,
        player: xIsNext ? 'X' : 'O',
      }),
    });

    const data = await response.json();
    setHistory(history.slice(0, currentStep + 1).concat([newSquares]));
    setCurrentStep(currentStep + 1);
    setXIsNext(!xIsNext);
  };

  const jumpTo = (step) => {
    setCurrentStep(step);
    setXIsNext(step % 2 === 0);
  };


  

  const winner = calculateWinner(history[currentStep]);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board squares={history[currentStep]} onClick={handleClick} />
      </div>
      <div className="game-info">
        <div>{status}</div>
        <ol>
          {history.map((step, move) => (
            <li key={move}>
              <button onClick={() => jumpTo(move)} disabled={move === currentStep}>
                {move === 0 ? 'Go to game start' : `Go to move #${move}`}
              </button>
            </li>
          ))}
        </ol>
        {winner && (
          <button onClick={startNewGame}>Start New Game</button>
        )}
      </div>
      <div className="games-played">
        <p>Total des parties jouées: {gamesPlayed}</p>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

export default Game;
