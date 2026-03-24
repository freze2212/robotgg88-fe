import React, { useMemo } from "react";
import { getAssetUrl } from "../utils/assetUrl";

type BigRoadBoardProps = {
  tableData?: any[];
};

function detectOutcome(item: any): "B" | "P" | "T" | null {
  if (typeof item?.count === "number" && item.count > 0) return "T";
  if (item?.isTie === true || item?.tie === true) return "T";
  if (item?.banker === true || item?.isBankerWin === true) return "B";
  if (item?.player === true || item?.isPlayerWin === true) return "P";

  if (typeof item?.road === "number") {
    if ([0, 1, 2].includes(item.road)) return "B";
    if ([8, 9, 10].includes(item.road)) return "P";
    return "T";
  }

  const v =
    item?.type ??
    item?.result ??
    item?.winner ??
    item?.value ??
    item?.outcome ??
    item?.roundResult;
  if (typeof v === "string") {
    const s = v.toUpperCase();
    if (s === "B" || s.includes("BANKER")) return "B";
    if (s === "P" || s.includes("PLAYER")) return "P";
    if (s === "T" || s.includes("TIE")) return "T";
  }
  return null;
}

function formatBaccaratResults(results: any[]) {
  const rows = 6;
  const formatted: any[] = [];
  const occupied = new Set<string>();
  const lastYByCol = new Map<number, number>();
  const colIndexByShowX = new Map<number, number>();
  let nextColIndex = 0;
  let lastType: "B" | "P" | null = null;
  let lastShowXRaw: number | null = null;
  let lastColIndex: number | null = null;

  let edgeLockActive = false;
  let edgePreferredRow: number | null = null;
  let edgeStartCol: number | null = null;
  let edgeStartFilled = false;

  for (let i = 0; i < results.length; i++) {
    const current = results[i];
    const outcome = detectOutcome(current);

    if (outcome === "T" || (typeof current?.count === "number" && current.count > 0)) {
      if (formatted.length > 0) {
        const lastIndex = formatted.length - 1;
        const last = formatted[lastIndex];
        const baseType = (String(last.type).replace("-H", "") as "B" | "P");
        const newType = baseType === "B" ? "B-H" : "P-H";
        const newTieCount = (typeof last.tieCount === "number" ? last.tieCount : 0) + 1;
        formatted[lastIndex] = {
          ...last,
          type: newType,
          isTie: true,
          tieCount: newTieCount,
        };
      }
      continue;
    }

    const rawX: number =
      typeof current?.showX === "number" ? current.showX : (lastShowXRaw ?? 0);
    const lastCell = formatted.length > 0 ? formatted[formatted.length - 1] : null;
    const lastBaseType = lastCell
      ? (String(lastCell.type).replace("-H", "") as "B" | "P")
      : null;
    const tieLockActive = !!(
      lastCell &&
      lastCell.isTie &&
      (lastCell.tieCount ?? 0) >= 2 &&
      lastBaseType
    );
    const continuingStreak =
      (outcome === "B" || outcome === "P") &&
      lastType !== null &&
      outcome === lastType &&
      lastColIndex !== null;

    let colIndex: number;
    if (tieLockActive && outcome === lastBaseType) {
      colIndex = lastColIndex ?? 0;
    } else if (tieLockActive && lastBaseType && outcome !== lastBaseType && lastColIndex !== null) {
      colIndex = nextColIndex++;
      colIndexByShowX.set(rawX, colIndex);
    } else if (continuingStreak) {
      colIndex = lastColIndex!;
    } else if (colIndexByShowX.has(rawX)) {
      colIndex = colIndexByShowX.get(rawX)!;
    } else {
      colIndex = nextColIndex++;
      colIndexByShowX.set(rawX, colIndex);
    }

    let inferred: "B" | "P";
    if (outcome === "B" || outcome === "P") {
      inferred = outcome;
    } else if (lastType == null) {
      inferred = "B";
    } else {
      inferred =
        lastColIndex !== null && colIndex !== lastColIndex
          ? lastType === "B"
            ? "P"
            : "B"
          : lastType;
    }

    const rowOccupied = (c: number, r: number) => occupied.has(`${c},${r}`);

    if (lastType !== null && inferred !== lastType) {
      let pref: number | null = null;
      if (rowOccupied(colIndex, rows - 1)) pref = rows - 2;
      else if (rowOccupied(colIndex, rows - 2)) pref = rows - 3;
      else if (rowOccupied(colIndex, rows - 3)) pref = rows - 4;
      else if (rowOccupied(colIndex, rows - 4)) pref = rows - 5;
      else if (rowOccupied(colIndex, rows - 5)) pref = rows - 6;
      else pref = null;

      if (pref !== null) {
        edgeLockActive = true;
        edgePreferredRow = pref;
        edgeStartCol = colIndex;
        edgeStartFilled = false;
      } else {
        edgeLockActive = false;
        edgePreferredRow = null;
        edgeStartCol = null;
        edgeStartFilled = false;
      }
    }

    let x = colIndex;
    let y: number;
    if (edgeLockActive && edgePreferredRow !== null) {
      const cleanDEF =
        !rowOccupied(colIndex, rows - 1) &&
        !rowOccupied(colIndex, rows - 2) &&
        !rowOccupied(colIndex, rows - 3);
      if (cleanDEF && edgeStartCol !== null && colIndex > edgeStartCol) {
        edgeLockActive = false;
      }
    }

    if (edgeLockActive && edgePreferredRow !== null) {
      if (edgeStartCol === colIndex && !edgeStartFilled) {
        const prevY = lastYByCol.get(colIndex) ?? -1;
        y = Math.min(prevY + 1, edgePreferredRow);
        if (y >= edgePreferredRow) edgeStartFilled = true;
        while (occupied.has(`${x},${y}`)) x += 1;
      } else {
        let target = edgePreferredRow;
        while (target >= 0 && rowOccupied(colIndex, target)) target -= 1;
        if (target < 0) target = 0;
        y = target;
        while (occupied.has(`${x},${y}`)) x += 1;
      }
    } else {
      const prevY = lastYByCol.get(colIndex) ?? -1;
      y = prevY + 1;
      if (y >= rows) y = rows - 1;
      while (occupied.has(`${x},${y}`)) x += 1;
    }

    formatted.push({
      x,
      y,
      tieCount: 0,
      type: inferred,
      isTie: false,
      colIndex,
    });
    occupied.add(`${x},${y}`);
    lastYByCol.set(colIndex, Math.min(y, rows - 1));
    lastType = inferred;
    lastShowXRaw = rawX;
    lastColIndex = colIndex;
  }

  return formatted;
}

const BigRoadBoard: React.FC<BigRoadBoardProps> = ({ tableData }) => {
  const computed = useMemo(() => {
    const rows = Array.isArray(tableData) ? tableData : [];
    return formatBaccaratResults(rows);
  }, [tableData]);

  const rows = 6;
  const cols = 20;
  const baseWidth = 855;
  const baseHeight = 203;
  const cellW = baseWidth / cols;
  const cellH = baseHeight / rows;
  const maxCol = Math.max(...computed.map((r: any) => r.x), 0);
  const pageSize = cols;
  const currentPage = Math.floor(maxCol / pageSize);
  const startCol = currentPage * pageSize;
  const endCol = startCol + pageSize;
  const displayData = computed
    .filter((r: any) => r.x >= startCol && r.x < endCol)
    .map((r: any) => ({ ...r, x: r.x - startCol }));

  return (
    <div
      className="room-big-road"
      style={{
        backgroundImage: `url(${getAssetUrl("/assets/caro-table.png")})`,
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#ffffff",
      }}
    >
      <div className="room-big-road__layer">
        {displayData.map((r: any, idx: number) => {
          const left = r.x * cellW + cellW / 2;
          const top = r.y * cellH + cellH / 2;
          let img: string;

          if (r.type === "B-H" || r.type === "P-H") {
            const variant = r.tieCount >= 3 ? 3 : r.tieCount >= 2 ? 2 : 1;
            if (r.type === "B-H") {
              img =
                variant === 1
                  ? "/assets/B-H.png"
                  : variant === 2
                    ? "/assets/B-H-2.png"
                    : "/assets/B-H-3.png";
            } else {
              img =
                variant === 1
                  ? "/assets/P-H.png"
                  : variant === 2
                    ? "/assets/P-H-2.png"
                    : "/assets/P-H-3.png";
            }
          } else if (r.type === "B") {
            img = "/assets/B.png";
          } else {
            img = "/assets/P.png";
          }

          return (
            <div
              key={`${idx}-${r.x}-${r.y}`}
              className="room-big-road__dot"
              style={{
                left: `${(left / baseWidth) * 100}%`,
                top: `${(top / baseHeight) * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <img src={getAssetUrl(img)} alt={r.type} className="room-big-road__icon" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BigRoadBoard;
