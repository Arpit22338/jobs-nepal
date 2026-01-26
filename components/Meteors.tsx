"use client";

import { useEffect, useState } from "react";

interface MeteorProps {
  number?: number;
}

export default function Meteors({ number = 20 }: MeteorProps) {
  const [meteors, setMeteors] = useState<Array<{ id: number; style: React.CSSProperties }>>([]);

  useEffect(() => {
    const generateMeteors = () => {
      return [...Array(number)].map((_, idx) => ({
        id: idx,
        style: {
          top: `${Math.random() * 40}%`,
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 8}s`,
          animationDuration: `${Math.random() * 4 + 5}s`, // Slower: 5-9 seconds
        },
      }));
    };
    setMeteors(generateMeteors());
  }, [number]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {meteors.map((meteor) => (
        <span
          key={meteor.id}
          className="meteor"
          style={meteor.style}
        />
      ))}
    </div>
  );
}
