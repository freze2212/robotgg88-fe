import React from "react";
import "./ProgressBar.css";
import { useNavigate } from "react-router-dom";

interface ProgressBarProps {
  percentage: number;
  title: string;
  imageUrl: string;
  id: string;
}

type StatusVariant = "wait" | "play" | "jackpot";

function getGameStatus(percent: number): { label: string; variant: StatusVariant } {
  if (percent >= 86) return { label: "JACKPOT", variant: "jackpot" };
  if (percent >= 80) return { label: "Chơi", variant: "play" };
  return { label: "Chờ", variant: "wait" };
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  title,
  imageUrl,
  id,
}) => {
  const navigate = useNavigate();
  const fixedPercent = Math.max(0, Math.min(100, Math.round(percentage)));
  const status = getGameStatus(fixedPercent);

  const handleClick = () => {
    localStorage.setItem("title_img", imageUrl);
    localStorage.setItem("title_text", title);
    localStorage.setItem("win_percent", fixedPercent.toString());
    navigate(`/NH/table/${id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="nh-slot-card"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="nh-slot-card__image-wrap">
        <img
          className="nh-slot-card__image"
          src={imageUrl}
          alt={title}
          loading="lazy"
        />
      </div>
      <div className="nh-slot-card__title" title={title}>
        {title}
      </div>
      <span className={`nh-slot-card__tag nh-slot-card__tag--${status.variant}`}>
        {status.label}
      </span>
      <div className="nh-slot-card__bar-wrap">
        <div className="nh-slot-card__bar-label">{fixedPercent}%</div>
        <div className="nh-slot-card__bar-track">
          <div
            className={`nh-slot-card__bar-fill nh-slot-card__bar-fill--${status.variant}`}
            style={{ width: `${fixedPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProgressBar);
