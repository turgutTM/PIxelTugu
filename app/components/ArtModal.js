"use client";
import React, { useEffect, useRef, useState } from "react";

const ArtModal = ({ selectedArt, onClose }) => {
  const modalCanvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (selectedArt && modalCanvasRef.current) {
      setIsLoading(true);
      const ctx = modalCanvasRef.current.getContext("2d");
      const modalSize = 350; // Increased size for better visibility
      modalCanvasRef.current.width = modalSize;
      modalCanvasRef.current.height = modalSize;
      
      // Create a subtle background pattern
      const drawBackground = () => {
        ctx.fillStyle = "#f8f9fa";
        ctx.fillRect(0, 0, modalSize, modalSize);
        
        // Add subtle grid pattern
        ctx.strokeStyle = "#eaeaea";
        ctx.lineWidth = 1;
        const gridSize = 20;
        
        for (let i = 0; i <= modalSize; i += gridSize) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, modalSize);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(modalSize, i);
          ctx.stroke();
        }
      };
      
      drawBackground();
      
      // Draw the pixel art with a slight delay for animation effect
      setTimeout(() => {
        ctx.imageSmoothingEnabled = false;
        const originalSize = selectedArt.canvasSize || 110;
        const scale = modalSize / originalSize;
        
        selectedArt.pixels.forEach(({ x, y, color }) => {
          ctx.fillStyle = color;
          ctx.fillRect(x * scale, y * scale, scale, scale);
        });
        
        // Add a subtle border around the canvas
        ctx.strokeStyle = "#ddd";
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, modalSize, modalSize);
        
        setIsLoading(false);
      }, 300);
    }
  }, [selectedArt]);

  if (!selectedArt) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
        }}
      >
        <div className="relative mb-4">
          <h3 className="text-xl font-medium text-gray-800 text-center">
            {selectedArt.title || "Pixel Artwork"}
          </h3>
          {selectedArt.artist && (
            <p className="text-gray-500 text-center mt-1">by {selectedArt.artist}</p>
          )}
        </div>

        <div className="relative flex justify-center items-center">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <canvas
            ref={modalCanvasRef}
            className="block mx-auto rounded-md transition-opacity duration-300"
            style={{ 
              imageRendering: "pixelated",
              opacity: isLoading ? 0.5 : 1,
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
            }}
          />
        </div>

        {selectedArt.description && (
          <p className="text-gray-600 text-center mt-4 mb-2 px-2 text-sm">
            {selectedArt.description}
          </p>
        )}

        <div className="flex justify-center mt-6">
          <button
            className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transform  hover:shadow-md"
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