'use client'

import React, { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { VerticalLine, HorizontalLine, Point, WalkerPath } from "../Amida2D/types";
import * as THREE from 'three';

type Props = {
  verticalLines: VerticalLine[];
  horizontalLines: HorizontalLine[];
  paths: WalkerPath[];
  goals: string[];
  startAllAmida: () => void;
  initializeAmida: (names: string[], bridges: number) => void;
  height: number;
};

export default function Amida3D({ 
  verticalLines, 
  horizontalLines, 
  paths,
  goals,
  startAllAmida, 
  initializeAmida,
  height 
}: Props) {
  
  const [walkers, setWalkers] = useState<{ [key: string]: [number, number, number] }>({});
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
    if (paths.length === 0) {
      setWalkers({});
      return;
    }
    
    let currentSegmentIndex = 0;
    let progress = 0;
    const speed = 0.1;

    const animate = () => {
      const maxLen = Math.max(...paths.map(p => p.points.length));

      if (currentSegmentIndex >= maxLen - 1) {
        const finalPositions: { [key: string]: [number, number, number] } = {};
        paths.forEach(p => {
          finalPositions[p.lineId] = getPositionFrom2DPoint(p.points[p.points.length - 1]);
        });
        setWalkers(finalPositions);
        return;
      }
      
      progress += speed;
      if (progress >= 1) {
        progress = 0;
        currentSegmentIndex++;
      }

      const newWalkers: { [key: string]: [number, number, number] } = {};

      paths.forEach(path => {
        if (currentSegmentIndex < path.points.length - 1) {
          const startP = path.points[currentSegmentIndex];
          const endP = path.points[currentSegmentIndex + 1];
          const startVec = new THREE.Vector3(...getPositionFrom2DPoint(startP));
          const endVec = new THREE.Vector3(...getPositionFrom2DPoint(endP));
          const currentVec = startVec.lerp(endVec, progress);
          newWalkers[path.lineId] = [currentVec.x, currentVec.y, currentVec.z];
        } else {
          newWalkers[path.lineId] = getPositionFrom2DPoint(path.points[path.points.length - 1]);
        }
      });

      setWalkers(newWalkers);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [paths, height]);

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

          {verticalLines.map((line, i) => {
            const [x, y, z] = getPositionFromIndex(line.lineIndex, 0.5);
            const [topX, topY, topZ] = getPositionFromIndex(line.lineIndex, 0);
            const [bottomX, bottomY, bottomZ] = getPositionFromIndex(line.lineIndex, 1.0);

            return (
              <group key={line.id}>
                <mesh position={[x, y, z]}>
                  <cylinderGeometry args={[0.1, 0.1, height, 16]} />
                  <meshStandardMaterial color={line.color} />
                </mesh>
                
                <Text
                  position={[topX, topY + 1, topZ]}
                  fontSize={0.8}
                  color={line.color}
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.05}
                  outlineColor="#000"
                >
                  {line.name}
                </Text>

                <Text
                  position={[bottomX, bottomY - 1, bottomZ]}
                  fontSize={1.2}
                  color="white"
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.05}
                  outlineColor="#000"
                >
                  {goals[i]}
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

          {Object.entries(walkers).map(([id, pos]) => {
            const color = paths.find(p => p.lineId === id)?.color || 'red';
            return (
              <mesh key={id} position={pos}>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
              </mesh>
            );
          })}

        </Canvas>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
         <button 
          onClick={startAllAmida}
          style={{
            padding: '12px 24px',
            cursor: 'pointer',
            backgroundColor: '#ff5722',
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}
        >
          一斉にスタート
        </button>
      </div>
    </div>
  );
}