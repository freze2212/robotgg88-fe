// components/ResultTable.tsx
import React, { useMemo } from "react";

export type ResultTableProps = {
  tableData?: any[];
  /** Bảng nhỏ cho thẻ lobby (445×280) */
  compact?: boolean;
};

/** Ma trận 12 cột × 6 hàng = tối đa 72 ô — không được vượt để tránh matrix[col] undefined */
const MATRIX_COLS = 12;
const MATRIX_ROWS = 6;
const MATRIX_MAX = MATRIX_COLS * MATRIX_ROWS;

function buildMatrix(tableData: any[]) {
  const matrix: (number | null)[][] = Array.from({ length: MATRIX_COLS }, () =>
    Array.from({ length: MATRIX_ROWS }, () => null)
  );

  const sorted = [...tableData].sort((a, b) => a.stampTime - b.stampTime);
  const isOverflow = sorted.some((item) => item.showX >= MATRIX_COLS);
  const displayItems = isOverflow
    ? sorted.map((item, index) => ({
        ...item,
        showX: Math.floor(index / MATRIX_ROWS),
        showY: index % MATRIX_ROWS,
      }))
    : sorted;

  /** Chỉ lấy tối đa 72 ván mới nhất (giống chỗ hiển thị trên bàn) */
  const capped = displayItems.slice(-MATRIX_MAX);

  capped.forEach((item: any, index: number) => {
    const col = Math.floor(index / MATRIX_ROWS);
    const row = index % MATRIX_ROWS;
    if (col >= 0 && col < MATRIX_COLS && row >= 0 && row < MATRIX_ROWS && matrix[col]) {
      matrix[col][row] = item.road;
    }
  });

  return matrix;
}

const getSymbolImage = (road: number) => {
  switch (road) {
    case 0:
    case 1:
    case 2:
      return "/assets/casino/symbol_b_small.png";
    case 8:
    case 9:
    case 10:
      return "/assets/casino/symbol_p_small.png";
    default:
      return "/assets/casino/symbol_t_small.png";
  }
};

const ResultTable: React.FC<ResultTableProps> = ({ tableData, compact }) => {
  const matrix = useMemo(() => {
    if (!tableData?.length) return null;
    return buildMatrix(tableData);
  }, [tableData]);

  if (!compact && (!tableData || !tableData.length)) return null;

  const m =
    matrix ??
    (Array.from({ length: 12 }, () => Array.from({ length: 6 }, () => null)) as (
      | number
      | null
    )[][]);

  const imgCls = compact ? "result-table--compact__symbol" : "mx-auto w-5 h-5";

  return (
    <div className={compact ? "result-table--compact" : "overflow-x-auto mt-4"}>
      <table
        className={
          compact
            ? "result-table--compact__table"
            : "mx-auto border-separate border-spacing-1 w-full h-[250px]"
        }
      >
        <tbody>
          {Array.from({ length: 6 }, (_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: 12 }, (_, colIndex) => (
                <td
                  key={colIndex}
                  className={
                    compact
                      ? "result-table--compact__cell"
                      : "border border-green-400 w-7 h-7 text-center align-middle"
                  }
                >
                  {m[colIndex][rowIndex] !== null && m[colIndex][rowIndex] !== undefined && (
                    <img
                      src={getSymbolImage(m[colIndex][rowIndex] as number)}
                      alt=""
                      className={imgCls}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultTable;
