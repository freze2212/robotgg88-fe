import { calcPathD } from "./Candle";
import { useEffect, useRef, useState } from "react";
import { genCandleFromValue } from "./data";

const HEIGHT = 300;
const CANDLE_W = 10;
const D = 4;

interface IProps {
  rounds: number[];
}

function CandleChart({ rounds }: IProps) {
  const [candles, setCandles] = useState(() =>
    rounds.map((round) => genCandleFromValue(round))
  );
  const [pathD, setPathD] = useState(calcPathD(candles));
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(0);
  const prevRoundsLen = useRef(rounds.length);

  useEffect(() => {
    if (rounds.length > prevRoundsLen.current) {
      // Có round mới được thêm
      const newRounds = rounds.slice(prevRoundsLen.current);
      const newCandles = newRounds.map((round) => genCandleFromValue(round));
      const updatedCandles = [...candles, ...newCandles];
      setCandles(updatedCandles);
      setPathD(calcPathD(updatedCandles));

      const allHighs = updatedCandles.map((c) => c.H);
      const allLows = updatedCandles.map((c) => c.L);
      setMax(Math.max(...allHighs));
      setMin(Math.min(...allLows));

      prevRoundsLen.current = rounds.length;
    }
  }, [rounds, candles]);

  const width = rounds.length * (CANDLE_W + D);

  return (
    <div className="px-3">
      <svg height={HEIGHT + 30} width={width} className=" my-20 w-full">
        {[...Array(10)].map((_, i) => {
          const y = (HEIGHT / 9) * i;
          return (
            <text
              key={`y-label-${i}`}
              x={0}
              y={y + 4}
              fontSize="10"
              fill="#888"
              textAnchor="start"
            >
              {i + 1}
            </text>
          );
        })}

        <path fill="#ee4947" stroke="#ee4947" d={pathD.dRed}></path>
        <path fill="#22f6db" stroke="#22f6db" d={pathD.dGreen}></path>

        {rounds.map((round, index) => {
          const x = index * (CANDLE_W + D) + CANDLE_W / 2;
          return (
            <text
              key={`x-label-${index}`}
              x={x}
              y={HEIGHT + 12}
              fontSize="10"
              textAnchor="middle"
              fill="#555"
            >
              {round}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export default CandleChart;
