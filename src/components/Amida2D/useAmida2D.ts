import { useState, useCallback } from "react";
import { VerticalLine, HorizontalLine, Point } from './types';

export function useAmida2D() {
  const [verticalLines, setVerticalLines] = useState<VerticalLine[]>([]);
  const [horizontalLines, setHorizontalLines] = useState<HorizontalLine[]>([]);

  const [path, setPath] = useState<Point[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const initializeAmida = useCallback((lineCount: number = 5) => {

    const newVerticalLines: VerticalLine[] = [];
    for (let i = 0; i < lineCount; i++) {
      newVerticalLines.push({
        id: `v-${i}`,
        lineIndex: i,
        x: (i + 1) / (lineCount + 1),
      });
    }

    const newHorizontalLines: HorizontalLine[] = [];
    for (let i = 0; i < lineCount - 1; i++) {
      const numBridges = Math.floor(Math.random() * 3) + 2;
      
      for (let j = 0; j < numBridges; j++) {
        newHorizontalLines.push({
          id: `h-${i}-${j}-${Date.now()}`,
          leftLineIndex: i,
          y: Math.random() * 0.8 + 0.1
        });
      }
    }
    setVerticalLines(newVerticalLines);
    setHorizontalLines(newHorizontalLines);
    setPath([]);
    setSelectedIndex(null);
  }, []);
  return { 
    verticalLines, 
    horizontalLines, 
    path, 
    selectedIndex, 
    initializeAmida 
  };
}