"use client";

import { useState, useEffect } from 'react';

const images = [
  '/image1.png',
  '/image2.png',
  '/image3.png'
];

export default function BackgroundSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '73px',
      left: 0,
      width: '100vw',
      height: 'calc(100vh - 73px)',
      zIndex: -2,
      overflow: 'hidden',
      pointerEvents: 'none'
    }}>
      {/* Slide Images */}
      {images.map((src, i) => (
        <div
          key={src}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            opacity: i === index ? 0.55 : 0,
            transition: 'opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      ))}
      
      {/* Right-to-Left Purple Color Palette Texture Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(to left, rgba(121, 66, 181, 0.55) 0%, rgba(208, 162, 247, 0.25) 50%, rgba(250, 250, 251, 0.15) 100%)',
        pointerEvents: 'none'
      }} />
    </div>
  );
}
