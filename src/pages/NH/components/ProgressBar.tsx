import React, { useState, useEffect } from 'react';
import './ProgressBar.css';
import { useNavigate } from 'react-router-dom';

interface ProgressBarProps {
  percentage: number;
  title: string;
  imageUrl: string;
  id: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage, title, imageUrl, id }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    localStorage.setItem("title_img", imageUrl);
    localStorage.setItem("title_text", title); // dùng cho TableGameNew (FE)
    localStorage.setItem("win_percent", percentage.toString()); // dùng cho TableGameNew (FE)
    navigate(`/NH/table/${id}`);
  };

  const fixedPercent = Math.max(0, Math.min(100, Math.round(percentage)));

  return (
    <div
      onClick={handleClick}
      className="nh-basic-card"
      role="button"
      tabIndex={0}
    >
      <img
        className="nh-basic-game-image"
        src={imageUrl}
        alt={title}
        loading="lazy"
      />
      <div className="nh-basic-game-title">{title}</div>
      <div className="nh-basic-bottom">
        <button
          type="button"
          className="nh-basic-play"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          Chơi
        </button>

        <div className="nh-basic-bar">
          <div className="nh-basic-bar__label">{fixedPercent}%</div>
          <div className="nh-basic-bar__track">
            <div
              className="nh-basic-bar__fill nh-basic-bar__fill--fixed"
              style={{ width: `${fixedPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProgressBar);