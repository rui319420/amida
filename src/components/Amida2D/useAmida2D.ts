import { useState, useCallback } from "react";
import { VerticalLine, HorizontalLine, Point, WalkerPath } from './types';

export function useAmida2D() {
  const [verticalLines, setVerticalLines] = useState<VerticalLine[]>([]);
  const [horizontalLines, setHorizontalLines] = useState<HorizontalLine[]>([]);
  const [paths, setPaths] = useState<WalkerPath[]>([]);
  const [goals, setGoals] = useState<string[]>([]);

  const initializeAmida = useCallback((memberNames: string[], bridgeCount: number) => {
    const lineCount = memberNames.length;
    const colors = [
      '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', 
      '#00ffff', '#ffa500', '#800080', '#008000', '#ffc0cb'
    ];

    const newVerticalLines: VerticalLine[] = [];
    for (let i = 0; i < lineCount; i++) {
      newVerticalLines.push({
        id: `v-${i}`,
        lineIndex: i,
        x: (i + 1) / (lineCount + 1),
        name: memberNames[i],
        color: colors[i % colors.length]
      });
    }

    const newHorizontalLines: HorizontalLine[] = [];
    if (lineCount > 1) {
      for (let i = 0; i < bridgeCount; i++) {
        const idx1 = Math.floor(Math.random() * lineCount);
        let idx2 = Math.floor(Math.random() * lineCount);
        while (idx1 === idx2) {
          idx2 = Math.floor(Math.random() * lineCount);
        }
        newHorizontalLines.push({
          id: `h-${i}-${Date.now()}`,
          index1: idx1,
          index2: idx2,
          y: Math.random() * 0.8 + 0.1
        });
      }
    }

    const newGoals = Array(lineCount).fill(null).map(() => Math.random() > 0.5 ? "1" : "2");

    setVerticalLines(newVerticalLines);
    setHorizontalLines(newHorizontalLines);
    setGoals(newGoals);
    setPaths([]);
  }, []);

  const calculatePath = (startIndex: number): Point[] => {
    const sortedHLines = [...horizontalLines].sort((a, b) => a.y - b.y);
    const newPath: Point[] = [];
    
    let currentLineIndex = startIndex;
    let currentY = 0;

    newPath.push({ x: verticalLines[currentLineIndex].x, y: 0 });

    for (const hLine of sortedHLines) {
      if (hLine.y > currentY) {
        if (hLine.index1 === currentLineIndex || hLine.index2 === currentLineIndex) {
          newPath.push({ x: verticalLines[currentLineIndex].x, y: hLine.y });
          const nextIndex = (hLine.index1 === currentLineIndex) ? hLine.index2 : hLine.index1;
          newPath.push({ x: verticalLines[nextIndex].x, y: hLine.y });
          currentLineIndex = nextIndex;
          currentY = hLine.y;
        }
      }
    }

    newPath.push({ x: verticalLines[currentLineIndex].x, y: 1 });
    return newPath;
  };

  const startAmida = useCallback((startIndex: number) => {
    const pathPoints = calculatePath(startIndex);
    setPaths([{
      lineId: verticalLines[startIndex].id,
      color: verticalLines[startIndex].color,
      points: pathPoints
    }]);
  }, [horizontalLines, verticalLines]);

  const startAllAmida = useCallback(() => {
    const newPaths: WalkerPath[] = verticalLines.map(line => ({
      lineId: line.id,
      color: line.color,
      points: calculatePath(line.lineIndex)
    }));
    setPaths(newPaths);
  }, [horizontalLines, verticalLines]);

  return { 
    verticalLines, 
    horizontalLines, 
    paths,
    goals,
    initializeAmida,
    startAmida,
    startAllAmida
  };
}