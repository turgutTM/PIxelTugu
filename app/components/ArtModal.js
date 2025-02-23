"use client";
import React, { useEffect, useRef } from "react";

const ArtModal = ({ selectedArt, onClose }) => {
  const modalCanvasRef = useRef(null);

  useEffect(() => {
    if (selectedArt && modalCanvasRef.current) {
      const ctx = modalCanvasRef.current.getContext("2d");
      const modalSize = 300;
      modalCanvasRef.current.width = modalSize;
      modalCanvasRef.current.height = modalSize;
      ctx.clearRect(0, 0, modalSize, modalSize);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, modalSize, modalSize);
      ctx.imageSmoothingEnabled = false;
      const originalSize = selectedArt.canvasSize || 110;
      const scale = modalSize / originalSize;
      selectedArt.pixels.forEach(({ x, y, color }) => {
        ctx.fillStyle = color;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      });
    }
  }, [selectedArt]);

  if (!selectedArt) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-4 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <canvas
          ref={modalCanvasRef}
          className="block mx-auto"
          style={{ imageRendering: "pixelated" }}
        />
        <div className="flex justify-center">
          <button
            className="bg-red-500 text-white mt-4 px-6 py-2 rounded-full hover:bg-red-600 transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArtModal;
