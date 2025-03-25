import React from "react";
import "./Board.css";

interface BoardProps {
  config?: {
    duration?: number;
    players?: number;
    blocks?: number;
    lives?: number
  };
}

const Board: React.FC<BoardProps> = ({ config = {} }) => {
  const size = 13; 
  
  const generateBoard = () => {
    return Array(size).fill(0).map((_, row) => {
      return Array(size).fill(0).map((_, col) => {
        if (row === 0 || row === size-1 || col === 0 || col === size-1) return '1';
        return '0';
      });
    });
  };

  const [board] = React.useState(generateBoard());

  const renderCell = (cell: string, rowIndex: number, colIndex: number) => {
    const cellTypes = {
      '0': 'empty-cell',
      '1': 'solid-block',
      'P': 'player'
    };

    return (
      <div 
        className={`game-cell ${cellTypes[cell as keyof typeof cellTypes]}`}
        key={`${rowIndex}-${colIndex}`}
      />
    );
  };

  return (
    <div className="game-board-container">
      <div className="game-board">
        {board.map((row, rowIndex) => (
          <div className="board-row" key={rowIndex}>
            {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Board;