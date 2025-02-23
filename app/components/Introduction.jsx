"use client";
import React, { useEffect, useState, useRef } from "react";

const Introduction = () => {
  const videoRef = useRef(null);
  const [squarePositions, setSquarePositions] = useState([]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 2.0;
    }
    setSquarePositions(
      Array.from({ length: 40 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }))
    );
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden z-20 bg-gradient-to-br from-red-500 to-[#1e272e] flex items-center justify-center">
      <div className="w-1/2 flex flex-col items-start px-9">
        <h1 className="md:text-6xl ml-3 font-pixelify text-pixelWhite font-bold tracking-wide drop-shadow-pixel mb-6 animate-bouncePixel">
          Welcome to Pixel Studio
        </h1>
        <p className="text-pixelWhite text-lg md:text-2xl max-w-2xl mx-auto text-start mb-10 ml-4">
          Create your pixel art dreams with ease! Dive into a colorful, creative
          journey.
        </p>
        <button className="text-lg md:text-lg w-fit ml-3 font-mono bg-pixelPink hover:bg-pixelYellow text-pixelBlack py-2 px-5 rounded-full transition-all duration-300 shadow-pixel hover:scale-105">
          Start Drawing!
        </button>
      </div>

      <div className="w-1/2 flex justify-center relative">
        <div
          className="w-3/4 h-3/4  bg-pixelBlack border-4 border-pixelPink rounded-xl flex justify-center items-center shadow-pixel-inset"
          style={{
            transform: "perspective(800px) rotateY(-15deg)",
            overflow: "hidden",
          }}
        >
          <video
            ref={videoRef}
            src="/Pixelscreen.mov"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
      </div>

      {squarePositions.map((pos, index) => (
        <div
          key={index}
          className="absolute w-4 h-4 bg-gradient-to-br from-pixelPink to-pixelBlue rounded animate-float"
          style={pos}
        />
      ))}
    </div>
  );
};

export default Introduction;
