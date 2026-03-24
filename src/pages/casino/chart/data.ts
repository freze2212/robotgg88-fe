import type { Candle } from "./Candle";

// Trả về -1 hoặc 1 ngẫu nhiên
const Direction = (): number => (Math.random() < 0.5 ? -1 : 1);

// Trả về số ngẫu nhiên trong khoảng 0 đến `rand`
const Random = (rand: number): number => Math.random() * rand;

// 30% xác suất trả về 0, còn lại random từ 0 đến `rand`
const RandomProbabilityZero = (rand: number): number =>
  Math.random() < 0.3 ? 0 : Random(rand);

// Làm tròn 2 chữ số thập phân
const Round = (num: number): number => Math.round(num * 100) / 100;

// Tạo 1 cây nến dựa trên Close price của cây trước đó
export function genCandle(prevCandleC: number): Candle {
  const O = prevCandleC;
  const C = Round(O + Direction() * Random(500));
  const H = Round((O < C ? C : O) + RandomProbabilityZero(300));
  const L = Round((O > C ? C : O) - RandomProbabilityZero(300));
  return { O, H, L, C };
}

// Tạo danh sách `amount` cây nến bắt đầu từ giá `initNum`
export function genCandles(initNum: number, amount: number): Candle[] {
  const candles: Candle[] = [genCandle(initNum)];
  for (let i = 0; i < amount; i++) {
    candles.push(genCandle(candles[i].C));
  }
  return candles;
}

export function genCandleFromValue(value: number) {
  const base = value;
  const H = base + Math.random() * 5;
  const L = base - Math.random() * 5;
  const O = base + (Math.random() - 0.5) * 4;
  const C = base;
  const isGreen = C >= O;
  return { O, H, L, C, isGreen };
}
