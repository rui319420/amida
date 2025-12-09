'use client'

import React, { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { VerticalLine, HorizontalLine, Point } from "../Amida2D/types";
import * as THREE from 'three';

type Props = {
  verticalLines: VerticalLine[];
  horizontalLines: HorizontalLine[];
  path: Point[];
  startAmida: (index: number) => void;
  initializeAmida: (names: string[], bridges: number) => void;
  height: number;
};

export default function Amida3D({ 
  verticalLines, 
  horizontalLines, 
  path,
  startAmida, 
  initializeAmida,
  height 
}: Props) {
  
  const [walkerPos, setWalkerPos] = useState<[number, number, number] | null>(null);
  const requestRef = useRef<number>(0);

  const RADIUS = 3;

  const getPositionFromIndex = (index: number, yRatio: number): [number, number, number] => {
    const count = verticalLines.length;
    if (count === 0) return [0, 0, 0];
    const angle = (index / count) * Math.PI * 2 + Math.PI / 2;
    const x = Math.cos(angle) * RADIUS;
    const z = Math.sin(angle) * RADIUS;
    const y3d = (0.5 - yRatio) * height; 
    return [x, y3d, z];
  };

  const getPositionFrom2DPoint = (p: Point): [number, number, number] => {
    const count = verticalLines.length;
    const index = Math.round(p.x * (count + 1) - 1);
    return getPositionFromIndex(index, p.y);
  };

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
        setWalkerPos(getPositionFrom2DPoint(path[path.length - 1]));
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
      const startVec = new THREE.Vector3(...getPositionFrom2DPoint(startP));
      const endVec = new THREE.Vector3(...getPositionFrom2DPoint(endP));
      const currentVec = startVec.lerp(endVec, progress);
      setWalkerPos([currentVec.x, currentVec.y, currentVec.z]);
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [path, height]);

  return (
    <div className="amida-wrapper" style={{ width: '100%' }}> 
      <div 
        className="amida-board" 
        style={{ 
          background: '#222', 
          width: '100%', 
          maxWidth: '600px',
          height: '80vh',
        }}
      >
        <Canvas camera={{ position: [0, 10, 20], fov: 45 }}>
          <color attach="background" args={['#222']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <OrbitControls />

          {verticalLines.map((line) => {
            const [x, y, z] = getPositionFromIndex(line.lineIndex, 0.5);
            const [topX, topY, topZ] = getPositionFromIndex(line.lineIndex, 0);

            return (
              <group key={line.id}>
                <mesh position={[x, y, z]}>
                  <cylinderGeometry args={[0.1, 0.1, height, 16]} />
                  <meshStandardMaterial color="#fb8c00" />
                </mesh>
                
                <Text
                  position={[topX, topY + 1, topZ]}
                  fontSize={0.8}
                  color="white"
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.05}
                  outlineColor="#000"
                >
                  {line.name}
                </Text>
              </group>
            );
          })}

          {horizontalLines.map((hLine) => {
            const startPos = getPositionFromIndex(hLine.index1, hLine.y);
            const endPos = getPositionFromIndex(hLine.index2, hLine.y);
            const centerX = (startPos[0] + endPos[0]) / 2;
            const centerY = startPos[1];
            const centerZ = (startPos[2] + endPos[2]) / 2;
            const dist = Math.sqrt(
              Math.pow(endPos[0] - startPos[0], 2) + 
              Math.pow(endPos[2] - startPos[2], 2)
            );
            const angle = Math.atan2(endPos[2] - startPos[2], endPos[0] - startPos[0]);

            return (
              <mesh 
                key={hLine.id} 
                position={[centerX, centerY, centerZ]} 
                rotation={[0, -angle, Math.PI / 2]}
              >
                <cylinderGeometry args={[0.05, 0.05, dist, 8]} />
                <meshStandardMaterial color="#fff" />
              </mesh>
            );
          })}

          {walkerPos && (
            <mesh position={walkerPos}>
              <sphereGeometry args={[0.5, 32, 32]} />
              <meshStandardMaterial color="red" emissive="red" emissiveIntensity={0.5} />
            </mesh>
          )}

        </Canvas>
      </div>
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        justifyContent: 'center', 
        flexWrap: 'wrap',
        maxWidth: '800px'
      }}>
         {verticalLines.map((line) => (
          <button 
            key={line.id} 
            onClick={() => startAmida(line.lineIndex)}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              backgroundColor: '#fb8c00',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}
          >
            {line.name} でスタート
          </button>
        ))}
      </div>
    </div>
  );
}