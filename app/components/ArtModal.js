"use client";
import React, { useEffect, useRef, useState } from "react";

const ArtModal = ({ selectedArt, onClose }) => {
  const modalCanvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (selectedArt && modalCanvasRef.current) {
      setIsLoading(true);
      setIsAnimating(true);
      const ctx = modalCanvasRef.current.getContext("2d");
      const modalSize = 380;
      modalCanvasRef.current.width = modalSize;
      modalCanvasRef.current.height = modalSize;
      
   
      const drawBackground = () => {
    
        const gradient = ctx.createLinearGradient(0, 0, modalSize, modalSize);
        gradient.addColorStop(0, "#f9f7ff");
        gradient.addColorStop(1, "#f0f8ff");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, modalSize, modalSize);
        
    
        ctx.fillStyle = "rgba(220, 220, 240, 0.5)";
        const dotSpacing = 15;
        const dotSize = 2;
        
        for (let x = dotSpacing/2; x < modalSize; x += dotSpacing) {
          for (let y = dotSpacing/2; y < modalSize; y += dotSpacing) {
            ctx.beginPath();
            ctx.arc(x, y, dotSize/2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      };
      
      drawBackground();
      
     
      const originalSize = selectedArt.canvasSize || 110;
      const scale = modalSize / originalSize;
      const pixels = [...selectedArt.pixels];
      
     
      const centerX = originalSize / 2;
      const centerY = originalSize / 2;
      pixels.sort((a, b) => {
        const distA = Math.sqrt(Math.pow(a.x - centerX, 2) + Math.pow(a.y - centerY, 2));
        const distB = Math.sqrt(Math.pow(b.x - centerX, 2) + Math.pow(b.y - centerY, 2));
        return distA - distB;
      });
      
    
      let pixelIndex = 0;
      const drawNextBatch = () => {
        ctx.imageSmoothingEnabled = false;
        const batchSize = Math.ceil(pixels.length / 10);
        const endIndex = Math.min(pixelIndex + batchSize, pixels.length);
        
        for (let i = pixelIndex; i < endIndex; i++) {
          const { x, y, color } = pixels[i];
          ctx.fillStyle = color;
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
        
        pixelIndex = endIndex;
        
        if (pixelIndex < pixels.length) {
          requestAnimationFrame(drawNextBatch);
        } else {
       
          ctx.strokeStyle = "#9c88ff";
          ctx.lineWidth = 3;
          ctx.strokeRect(0, 0, modalSize, modalSize);
          
         
          ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
          ctx.lineWidth = 4;
          ctx.strokeRect(4, 4, modalSize - 8, modalSize - 8);
          
          setIsLoading(false);
          setTimeout(() => setIsAnimating(false), 300);
        }
      };
      
      setTimeout(drawNextBatch, 300);
    }
  }, [selectedArt]);

  if (!selectedArt) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-500 ease-out ${
          isAnimating ? "scale-95 opacity-90" : "scale-100 opacity-100"
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ 
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
          background: "linear-gradient(145deg, #ffffff, #f5f7fa)"
        }}
      >
        <div className="relative mb-6">
          <h3 className="text-2xl font-bold text-gray-800 text-center">
            {selectedArt.title || "Pixel Masterpiece"}
          </h3>
          {selectedArt.artist && (
            <p className="text-indigo-600 text-center mt-2 font-medium">
              by {selectedArt.artist}
            </p>
          )}
          <div className="absolute w-16 h-1 bg-indigo-500 bottom-0 left-1/2 transform -translate-x-1/2 mt-2 rounded-full"></div>
        </div>

        <div className="relative flex justify-center items-center mb-5">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-sky-50">
            <canvas
              ref={modalCanvasRef}
              className="block mx-auto rounded-lg transition-all duration-500"
              style={{ 
                imageRendering: "pixelated",
                opacity: isLoading ? 0.5 : 1,
                transform: isLoading ? "scale(0.95)" : "scale(1)",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
              }}
            />
          </div>
        </div>

        {selectedArt.description && (
          <div className="bg-gray-50 rounded-xl p-4 mt-6 mb-3">
            <p className="text-gray-700 text-center px-2 leading-relaxed">
              {selectedArt.description}
            </p>
          </div>
        )}

        <div className="flex justify-center mt-8">
          <button
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-full hover:from-indigo-600 hover:to-purple-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transform hover:-translate-y-1 hover:shadow-lg font-medium"
            onClick={onClose}
          >
            Close Gallery
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArtModal;