"use client";
import React, { useEffect, useRef } from "react";

const CanvasCell = ({ art, onClick }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!art || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const originalSize = art.canvasSize || 110;
    const finalSize = 200;
    canvasRef.current.width = finalSize;
    canvasRef.current.height = finalSize;
    ctx.clearRect(0, 0, finalSize, finalSize);
    ctx.imageSmoothingEnabled = false;
    const scale = finalSize / originalSize;
    art.pixels.forEach(({ x, y, color }) => {
      ctx.fillStyle = color;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    });
  }, [art]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-56 border border-gray-600 rounded-lg cursor-pointer bg-white"
      style={{ imageRendering: "pixelated" }}
      onClick={onClick}
    />
  );
};

export default CanvasCell;
