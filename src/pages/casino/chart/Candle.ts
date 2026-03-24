// constants
const HEIGHT = 200;
const CANDLE_W = 10; // chiều rộng cây nến
const D = 4; // khoảng cách giữa 2 cây nến
let deltaY = 0; // tỉ số số pixel / giá trị nến
let min = 0;
let max = 0;

// định nghĩa kiểu dữ liệu cho cây nến
export interface Candle {
  O: number; // Open
  H: number; // High
  L: number; // Low
  C: number; // Close
}

// kết quả trả về từ calcPathD
interface PathD {
  dRed: string;
  dGreen: string;
}

// tính `d` của tất cả cây nến
export function calcPathD(candles: Candle[]): PathD {
  findMinMax(candles);
  deltaY = HEIGHT / (max - min);

  let dRed = "";
  let dGreen = "";

  candles.forEach((candle, index) => {
    if (candle.O < candle.C) {
      // nến xanh
      dGreen += calcD(candle, index);
    } else {
      // nến đỏ (đảo O và C để body hiển thị đúng)
      const candleTemp: Candle = {
        H: candle.H,
        O: candle.C,
        C: candle.O,
        L: candle.L,
      };
      dRed += calcD(candleTemp, index);
    }
  });

  return { dRed, dGreen };
}

// tính `d` của một cây nến cụ thể
function calcD(candle: Candle, index: number): string {
  const posH = (max - candle.H) * deltaY;
  const posO = (max - candle.O) * deltaY;
  const posC = (max - candle.C) * deltaY;
  const posL = (max - candle.L) * deltaY;

  const posXCandle = index * (CANDLE_W + D) + CANDLE_W / 2;

  let d = `M ${posXCandle} ${posH} L ${posXCandle} ${posO} `;
  d += `M ${posXCandle - CANDLE_W / 2} ${posO} `;
  d += `L ${posXCandle + CANDLE_W / 2} ${posO} `;
  d += `L ${posXCandle + CANDLE_W / 2} ${posC} `;
  d += `L ${posXCandle - CANDLE_W / 2} ${posC} Z `;
  d += `M ${posXCandle} ${posC} L ${posXCandle} ${posL} `;
  return d;
}

// tìm giá trị min/max trong toàn bộ danh sách
function findMinMax(candles: Candle[]): void {
  min = Number.MAX_VALUE;
  max = Number.MIN_VALUE;

  candles.forEach((candle) => {
    if (candle.H > max) max = candle.H;
    if (candle.L < min) min = candle.L;
  });
}
