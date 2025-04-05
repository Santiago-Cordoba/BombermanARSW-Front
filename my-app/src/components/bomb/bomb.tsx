import React from 'react';
import './Bomb.css';

interface BombProps {
  timer: number;
  isOwner: boolean;
}

const Bomb: React.FC<BombProps> = ({ timer, isOwner }) => {
  return (
    <div className={`bomb ${isOwner ? 'owner-bomb' : ''}`}>
      <div className="bomb-timer">{timer}</div>
    </div>
  );
};

export default Bomb;