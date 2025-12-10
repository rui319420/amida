'use client'

import React, { useEffect, useState, useRef } from "react";
import { Point, VerticalLine, HorizontalLine, WalkerPath } from "./types";

type Props = {
  verticalLines: VerticalLine[];
  horizontalLines: HorizontalLine[];
  paths: WalkerPath[];
  goals: string[];
  startAllAmida: () => void;
  initializeAmida: (names: string[], bridges: number) => void;
};

export default function Amida2D({ 
  verticalLines, 
  horizontalLines, 
  paths,
  goals,
  startAllAmida,
  initializeAmida 
}: Props) {
  const [walkers, setWalkers] = useState<{ [key: string]: Point }>({});
  const requestRef = useRef<number>(0);

  useEffect(() => {
    if (paths.length === 0) {
      setWalkers({});
      return;
    }
    
    let progress = 0;
    let currentSegmentIndex = 0;
    const speed = 0.005;

    const animate = () => {
      const maxLen = Math.max(...paths.map(p => p.points.length));
      if (currentSegmentIndex >= maxLen - 1) {
        const finalPositions: { [key: string]: Point } = {};
        paths.forEach(p => {
          finalPositions[p.lineId] = p.points[p.points.length - 1];
        });
        setWalkers(finalPositions);
        return;
      }

      progress += speed;

      if (progress >= 1) {
        progress = 0;
        currentSegmentIndex++;
      }

      const newWalkers: { [key: string]: Point } = {};
      
      paths.forEach(path => {
        if (currentSegmentIndex < path.points.length - 1) {
          const startP = path.points[currentSegmentIndex];
          const endP = path.points[currentSegmentIndex + 1];
          const currentX = startP.x + (endP.x - startP.x) * progress;
          const currentY = startP.y + (endP.y - startP.y) * progress;
          newWalkers[path.lineId] = { x: currentX, y: currentY };
        } else {
          newWalkers[path.lineId] = path.points[path.points.length - 1];
        }
      });

      setWalkers(newWalkers);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [paths]);

  return (
    <div className="amida-wrapper">
      <div style={{ display: 'flex', width: '100%', maxWidth: '500px', height: '60px', position: 'relative' }}>
        {verticalLines.map((line) => (
          <div
            key={line.id}
            style={{
              position: 'absolute',
              left: `${line.x * 100}%`,
              transform: 'translateX(-50%)',
              textAlign: 'center',
              fontSize: '12px',
              color: line.color,
              fontWeight: 'bold'
            }}
          >
            {line.name}
          </div>
        ))}
      </div>

      <div className="amida-board">
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
          {verticalLines.map((line) => (
            <line
              key={line.id}
              x1={line.x * 100} y1="0"
              x2={line.x * 100} y2="100"
              stroke={line.color} strokeWidth="0.5" opacity="0.5"
            />
          ))}
          {horizontalLines.map((hLine) => {
            const line1 = verticalLines.find(v => v.lineIndex === hLine.index1);
            const line2 = verticalLines.find(v => v.lineIndex === hLine.index2);
            if (!line1 || !line2) return null;
            return (
              <g key={hLine.id}>
                <line
                  x1={line1.x * 100} y1={hLine.y * 100}
                  x2={line2.x * 100} y2={hLine.y * 100}
                  stroke="#333" strokeWidth="0.5"
                />
                <circle cx={line1.x * 100} cy={hLine.y * 100} r="1" fill="#333" />
                <circle cx={line2.x * 100} cy={hLine.y * 100} r="1" fill="#333" />
              </g>
            );
          })}
          
          {verticalLines.map((line, i) => (
            <text
              key={`goal-${i}`}
              x={line.x * 100}
              y="98"
              fontSize="4"
              textAnchor="middle"
              fill="#333"
            >
              {goals[i]}
            </text>
          ))}

          {Object.entries(walkers).map(([id, pos]) => {
             const color = paths.find(p => p.lineId === id)?.color || 'red';
             return (
              <circle
                key={id}
                cx={pos.x * 100}
                cy={pos.y * 100}
                r="2"
                fill={color}
              />
            );
          })}
        </svg>
      </div>
      
      <button 
        onClick={startAllAmida}
        style={{
          padding: '10px 20px',
          backgroundColor: '#ff5722',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '16px'
        }}
      >
        一斉にスタート
      </button>
    </div>
  );
}