import React from "react";

interface IProps {
  dataRound: any;
  countDown: number;
  shuffle: number | null;
}

const ScoreBoard: React.FC<IProps> = ({
  dataRound,
  countDown,
  shuffle = null,
}) => {
  return (
    <div className="score-board-layout flex flex-col md:flex-row justify-between md:items-start items-center w-full gap-3 md:gap-4">
      {/* Khung trái: Tỷ lệ thắng - nền riêng */}
      <div className="flex flex-col items-center w-full md:w-auto">
        <h2 className="text-lg md:text-2xl font-semibold text-[#00d961] mb-1 md:mb-2 uppercase">
          Tỷ lệ thắng
        </h2>
        <div className="box-frame-result flex items-center justify-center">
          <span className="score-board-percent text-[#00ffe1] font-bold leading-none drop-shadow-[0_0_6px_#00ffe1]" id="winrate">
            {Math.round(dataRound?.percentCurrent.Forecast || 0)}%
          </span>
        </div>
      </div>
      {/* Khung phải: Dự đoán - nền riêng */}
      <div className="flex flex-col items-center w-full md:w-auto">
        <h2 className="text-lg md:text-2xl font-semibold text-[#00d961] mb-1 md:mb-2 uppercase">
          Dự đoán
        </h2>
        <div className="box-frame-result flex items-center justify-center px-3 md:px-4 py-2 md:py-3">
          <div className="flex flex-col md:flex-row items-center gap-1.5 md:gap-3 w-full justify-center">
            {dataRound?.percentCurrent.Round === "P" ? (
              <img src="/assets/casino/symbol_p.png" alt="prediction" className="w-9 h-9 md:w-12 md:h-12 object-contain flex-shrink-0" />
            ) : (
              <img src="/assets/casino/symbol_b.png" alt="prediction" className="w-9 h-9 md:w-12 md:h-12 object-contain flex-shrink-0" />
            )}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h3 className="text-white font-bold text-sm md:text-base">
                {dataRound?.percentCurrent.Round === "P" ? "PLAYER" : "BANKER"}
              </h3>
              <p className="text-white/90 text-xs md:text-sm">
                {shuffle !== 0
                  ? "Đang xào bài vui lòng chờ...."
                  : countDown === 0
                  ? "Chờ kết quả trong giây lát..."
                  : `Vòng tiếp theo sẽ bắt đầu sau ${countDown}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreBoard;
