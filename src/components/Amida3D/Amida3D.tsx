'use client'

import React, { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { VerticalLine, HorizontalLine, Point } from "../Amida2D/types";

type Props = {
  verticalLines: VerticalLine[];
  horizontalLines: HorizontalLine[];
  path: Point[];
  startAmida: (index: number) => void;
  initializeAmida: (count: number) => void;
};

export default function Amida3D({ 
  verticalLines, 
  horizontalLines, 
  path,
  startAmida, 
  initializeAmida 
}: Props) {
  
  // ▼▼▼ 1. アニメーション用の状態管理（2Dと同じ仕組み） ▼▼▼
  const [walkerPos, setWalkerPos] = useState<Point | null>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    if (path.length === 0) {
      setWalkerPos(null);
      return;
    }

    let currentSegmentIndex = 0;
    let progress = 0;
    const speed = 0.05;

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


  // ▼▼▼ 2. 座標変換のヘルパー関数 ▼▼▼
  // 2Dのデータ (x:0~1, y:0~1) を 3D空間の座標 (x:-5~5, y:4~-4) に変換
  const to3D = (x: number, y: number) => {
    const scaleX = 10; // 横幅の広がり
    const scaleY = 8;  // 縦幅の広がり
    return [
      (x - 0.5) * scaleX,  // X: 0.5を中心にして左右に広げる
      (0.5 - y) * scaleY,  // Y: 上(0)がプラス、下(1)がマイナスになるように反転
      0                    // Z: 奥行きは0
    ] as [number, number, number];
  };

  return (
    <div className="amida-wrapper">
      <div className="amida-board" style={{ background: '#222' }}>
        <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
          <color attach="background" args={['#222']} />
          
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <OrbitControls />

          {/* A. 縦線の描画 */}
          {verticalLines.map((line) => {
            const [x, y, z] = to3D(line.x, 0.5); // 中心位置
            return (
              <mesh key={line.id} position={[x, y, z]}>
                {/* 縦に長い円柱 */}
                <cylinderGeometry args={[0.1, 0.1, 8, 16]} />
                <meshStandardMaterial color="#fb8c00" />
              </mesh>
            );
          })}

          {/* B. 横線の描画 */}
          {horizontalLines.map((hLine) => {
            const leftV = verticalLines[hLine.leftLineIndex];
            const rightV = verticalLines[hLine.leftLineIndex + 1];
            if (!leftV || !rightV) return null;

            // 3D座標に変換
            const startPos = to3D(leftV.x, hLine.y);
            const endPos = to3D(rightV.x, hLine.y);

            // 横線の中心位置
            const centerX = (startPos[0] + endPos[0]) / 2;
            const centerY = startPos[1];
            
            // 横線の長さ
            const width = Math.abs(endPos[0] - startPos[0]);

            return (
              <mesh 
                key={hLine.id} 
                position={[centerX, centerY, 0]} 
                rotation={[0, 0, Math.PI / 2]} // 90度回転させて横向きにする
              >
                <cylinderGeometry args={[0.05, 0.05, width, 8]} />
                <meshStandardMaterial color="#fff" />
              </mesh>
            );
          })}

          {/* C. 動くボール（プレイヤー）の描画 */}
          {walkerPos && (
            <mesh position={to3D(walkerPos.x, walkerPos.y)}>
              <sphereGeometry args={[0.3, 32, 32]} />
              <meshStandardMaterial color="red" emissive="red" emissiveIntensity={0.5} />
            </mesh>
          )}

        </Canvas>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
         {verticalLines.map((line) => (
          <button 
            key={line.id} 
            onClick={() => startAmida(line.lineIndex)}
            style={{
              padding: '5px 10px',
              cursor: 'pointer',
              backgroundColor: '#fb8c00',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            {line.lineIndex + 1}
          </button>
        ))}
      </div>
      
      <button className="reset-button" onClick={() => initializeAmida(5)}>
        リセット
      </button>
    </div>
  );
}