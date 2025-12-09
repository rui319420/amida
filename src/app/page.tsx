'use client'

import React, { useState, useEffect } from 'react';
import Amida2D from "../components/Amida2D/Amida2D";
import Amida3D from '../components/Amida3D/Amida3D';
import { useAmida2D } from '../components/Amida2D/useAmida2D';

export default function Home() {
  const amidaData = useAmida2D();
  
  const [is3D, setIs3D] = useState(false);

  const [nameInput, setNameInput] = useState("A\nB\nC\nD\nE");
  const [bridgeCount, setBridgeCount] = useState(20);
  const [height, setHeight] = useState(15);

  const getNamesFromInput = () => {
    return nameInput
      .split('\n') 
      .map(s => s.trim())
      .filter(s => s !== "");
  };

  useEffect(() => {
    const names = getNamesFromInput();
    amidaData.initializeAmida(names, bridgeCount);
  }, []);

  const handleRegenerate = () => {
    const names = getNamesFromInput();
    if (names.length < 2) {
      alert("名前は2人以上入力してください");
      return;
    }
    amidaData.initializeAmida(names, bridgeCount);
  };

  return (
    <div className="container" style={{ 
      maxWidth: '100%',
      transition: 'max-width 0.3s'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginBottom: '20px', width: '100%' }}>
        <h1>{is3D ? "3D あみだくじ" : "2D あみだくじ"}</h1>
        
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          padding: '20px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '8px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'flex-start',
          maxWidth: '800px',
          width: '90%'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontWeight: 'bold' }}>参加者 (改行で区切る):</label>
            <textarea 
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              rows={5}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '150px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <label>
              横線の数:
              <input 
                type="number" 
                value={bridgeCount} 
                onChange={(e) => setBridgeCount(Number(e.target.value))}
                style={{ marginLeft: '5px', width: '60px', padding: '5px' }}
                min="0" max="100"
              />
            </label>
            {is3D && (
              <label>
                縦の長さ:
                <input 
                  type="number" 
                  value={height} 
                  onChange={(e) => setHeight(Number(e.target.value))}
                  style={{ marginLeft: '5px', width: '60px', padding: '5px' }}
                  min="5" max="50"
                />
              </label>
            )}
            
            <button onClick={handleRegenerate} className="reset-button">
              あみだくじを作り直す
            </button>
          </div>
        </div>

        <button 
          onClick={() => setIs3D(!is3D)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#333',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer'
          }}
        >
          {is3D ? "2Dモードへ戻る" : "3Dモードへ切り替え"}
        </button>
      </div>

      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        {is3D ? (
          <Amida3D 
            {...amidaData} 
            height={height} 
            initializeAmida={(names, b) => amidaData.initializeAmida(names, b)}
          />
        ) : (
          <Amida2D 
            {...amidaData} 
            initializeAmida={(names, b) => amidaData.initializeAmida(names, b)} 
          />
        )}
      </div>
    </div>
  );
}