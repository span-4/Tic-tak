import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import checkWinner from '../functions/checkWinner';

const socket = io('http://192.168.100.4:3001');

const GameBoard = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXTurn, setIsXTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [playerSymbol, setPlayerSymbol] = useState(null);
  const [isSpectator, setIsSpectator] = useState(false);

  useEffect(() => {
    socket.on('playerSymbol', (symbol) => setPlayerSymbol(symbol));
    socket.on('spectator', () => setIsSpectator(true));

    socket.on('gameState', ({ board, isXTurn }) => {
      setBoard(board);
      setIsXTurn(isXTurn);
      setWinner(checkWinner(board));
    });

    return () => {
      socket.off('playerSymbol');
      socket.off('spectator');
      socket.off('gameState');
    };
  }, []);

  const handleClick = (index) => {
    if (board[index] || winner || isSpectator || (isXTurn ? 'X' : 'O') !== playerSymbol) return;
    socket.emit('move', { index, symbol: playerSymbol });
  };

  const handleReset = () => {
    if (isSpectator) return;
    socket.emit('reset');
  };

  const backgroundColor = winner
    ? winner === 'X'
      ? '#d4edda'
      : winner === 'O'
      ? '#f8d7da'
      : '#f0e68c'
    : '#afaff9';
  const resetButtonStyle =
    winner || board.every((cell) => cell !== null)
      ? { backgroundColor: '#6c757d', color: '#fff' }
      : {};

  return (
    <div className="game-container" style={{ backgroundColor }}>
      <h2 className="status">
        {isSpectator
          ? 'Вы наблюдаете за игрой'
          : winner
          ? winner === 'draw'
            ? 'Ничья!'
            : `Победитель: ${winner}`
          : `Ваш символ: ${playerSymbol} | Ходит: ${isXTurn ? 'X' : 'O'}`}
      </h2>
      <div className="board">
        {board.map((cell, index) => (
          <div key={index} className="cell" onClick={() => handleClick(index)}>
            {cell}
          </div>
        ))}
      </div>
      <button
        className="reset-btn"
        style={resetButtonStyle}
        onClick={handleReset}
        disabled={isSpectator}>
        Сброс
      </button>
    </div>
  );
};

export default GameBoard;
