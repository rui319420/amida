'use client'

import React, { useState, useEffect } from 'react';
import Amida2D from "../components/Amida2D/Amida2D";
import Amida3D from '../components/Amida3D/Amida3D';
import { useAmida2D } from '../components/Amida2D/useAmida2D';

export default function Home() {
  const amidaData = useAmida2D();
  
  const [is3D, setIs3D] = useState(false);

  useEffect(() => {
    amidaData.initializeAmida(5);
  }, []);

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
        <h1>{is3D ? "3D あみだくじ" : "2D あみだくじ"}</h1>
        
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
          {is3D ? "2Dモードへ" : "3Dモードへ"}
        </button>
      </div>

      {is3D ? (
        <Amida3D {...amidaData} />
      ) : (
        <Amida2D {...amidaData} />
      )}
    </div>
  );
}