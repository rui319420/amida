'use client'

import React, { useEffect, useState, useRef } from "react";
import { useAmida2D } from "./useAmida2D";
import { Point } from "./types";

export default function Amida2D() {
  const { verticalLines, horizontalLines, path, initializeAmida, startAmida } = useAmida2D();

  const [walkerPos, setWalkerPos] = useState<Point | null>(null);

  const requestRef = useRef<number>(0);

  useEffect(() => {
    initializeAmida(5);
  }, [initializeAmida]);

  useEffect(() => {
    if (path.length === 0) {
      setWalkerPos(null);
      return;
    }

    let currentSegmentIndex = 0
    let progress = 0;
    const speed = 0.03;

    const animate = () => {
      if (currentSegmentIndex >= path.length - 1) {
        setWalkerPos(path[path.length - 1]);
        return;
      }

      const startP = path[currentSegmentIndex];
      const endP = path[currentSegmentIndex + 1];

      progress += speed;

      if (progress >= 1) {
        progress = 0;
        currentSegmentIndex++;
        requestRef.current = requestAnimationFrame(animate);
        return; 
      }

      const currentX = startP.x + (endP.x - startP.x) * progress;
      const currentY = startP.y + (endP.y - startP.y) * progress;

      setWalkerPos({ x: currentX, y: currentY });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(requestRef.current);
  }, [path]);

  const pathString = path
    .map((p) => `${p.x * 100},${p.y * 100}`)
    .join(" ");

  return (
    <div className="amida-wrapper">
      <div style={{ display: 'flex', width: '100%', maxWidth: '500px', height: '40px', position: 'relative' }}>
        {verticalLines.map((line) => (
          <button
            key={line.id}
            onClick={() => startAmida(line.lineIndex)}
            style={{
              position: 'absolute',
              left: `${line.x * 100}%`,
              transform: 'translateX(-50%)',
              padding: '5px 10px',
              cursor: 'pointer',
              backgroundColor: '#ff5722',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            Start
          </button>
        ))}
      </div>

      <div className="amida-board">
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
          
          {verticalLines.map((line) => (
            <line
              key={line.id}
              x1={line.x * 100} y1="0"
              x2={line.x * 100} y2="100"
              stroke="#ddd" strokeWidth="0.5"
            />
          ))}

          {horizontalLines.map((hLine) => {
            const leftV = verticalLines[hLine.leftLineIndex];
            const rightV = verticalLines[hLine.leftLineIndex + 1];
            if (!leftV || !rightV) return null;
            return (
              <line
                key={hLine.id}
                x1={leftV.x * 100} y1={hLine.y * 100}
                x2={rightV.x * 100} y2={hLine.y * 100}
                stroke="#ddd" strokeWidth="0.5"
              />
            );
          })}

          {path.length > 0 && (
            <polyline
              points={pathString}
              stroke="rgba(255, 0, 0, 0.2)"
              strokeWidth="1"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {walkerPos && (
            <circle
              cx={walkerPos.x * 100}
              cy={walkerPos.y * 100}
              r="2"
              fill="red"
            />
          )}

        </svg>
      </div>

      <button className="reset-button" onClick={() => initializeAmida(5)}>
        あみだくじをリセット
      </button>
    </div>
  );
}