"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { FaArrowRotateLeft, FaArrowRotateRight } from "react-icons/fa6";

const DEFAULT_COLOR = "#FFFFFF";
const BRUSH_ICON = "🖌️";
const ERASER_ICON = "🩹";
const TRASH_ICON = "🗑️";
const COLOR_PALETTE = [
  "#FFFFFF",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FFA500",
  "#C0C0C0",
  "#000000",
];
const CATEGORY_OPTIONS = [
  "romantic",
  "technology",
  "abstract",
  "nature",
  "monthly art",
];
const CANVAS_SIZES = [50, 100, 150, 200];

export default function PixelArtDrawingPage() {
  const user = useSelector((state) => state.user.user);
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const [canvasState, setCanvasState] = useState({
    size: 50,
    pixels: Array.from({ length: 50 * 50 }, () => DEFAULT_COLOR),
  });
  const { size: canvasSize, pixels } = canvasState;
  const [brushSize, setBrushSize] = useState(1);
  const [isPainting, setIsPainting] = useState(false);
  const [tool, setTool] = useState("brush");
  const [currentColor, setCurrentColor] = useState("#000000");
  const [isToolboxOpen, setIsToolboxOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [showGrid, setShowGrid] = useState(true);
  const [isDrawingLoading, setIsDrawingLoading] = useState(false);
  const [isCanvasMenuOpen, setIsCanvasMenuOpen] = useState(false);
  const brushDebounceRef = useRef(null);
  useEffect(() => {
    if (brushDebounceRef.current) clearTimeout(brushDebounceRef.current);
    brushDebounceRef.current = setTimeout(() => {
      setBrushSize(brushSize);
    }, 300);
  }, [brushSize]);
  useEffect(() => {
    setIsDrawingLoading(true);
    const timer = setTimeout(() => {
      setIsDrawingLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [canvasState.size]);
  const pushUndo = (state) => {
    setUndoStack((u) => [...u, state]);
    setRedoStack([]);
  };
  const undo = () => {
    if (!undoStack.length) return;
    setRedoStack((r) => [...r, canvasState]);
    const prevState = undoStack[undoStack.length - 1];
    setCanvasState(prevState);
    setUndoStack((u) => u.slice(0, -1));
  };
  const redo = () => {
    if (!redoStack.length) return;
    setUndoStack((u) => [...u, canvasState]);
    const nextState = redoStack[redoStack.length - 1];
    setCanvasState(nextState);
    setRedoStack((r) => r.slice(0, -1));
  };
  const handleMouseDown = (index) => {
    setIsPainting(true);
    pushUndo(canvasState);
    paintPixel(index);
  };
  const handleMouseUp = () => {
    setIsPainting(false);
  };
  const handleMouseEnter = (index) => {
    if (isPainting) paintPixel(index);
  };
  const paintPixel = (index) => {
    const newPixels = [...pixels];
    const row = Math.floor(index / canvasSize);
    const col = index % canvasSize;
    for (
      let i = row - Math.floor(brushSize / 2);
      i <= row + Math.floor(brushSize / 2);
      i++
    ) {
      for (
        let j = col - Math.floor(brushSize / 2);
        j <= col + Math.floor(brushSize / 2);
        j++
      ) {
        if (i >= 0 && i < canvasSize && j >= 0 && j < canvasSize) {
          const idx = i * canvasSize + j;
          newPixels[idx] = tool === "eraser" ? DEFAULT_COLOR : currentColor;
        }
      }
    }
    setCanvasState({ size: canvasSize, pixels: newPixels });
  };
  const handleClearCanvas = () => {
    setCanvasState({
      size: canvasSize,
      pixels: Array.from(
        { length: canvasSize * canvasSize },
        () => DEFAULT_COLOR
      ),
    });
    setShowConfirmModal(false);
  };
  const handleToolboxToggle = () => {
    setIsToolboxOpen(!isToolboxOpen);
  };
  const handleToolSelection = (selectedTool) => {
    setTool(selectedTool);
    setIsPaletteOpen(selectedTool === "brush");
  };
  const handleColorSelect = (color) => {
    setCurrentColor(color);
  };
  const handleCanvasSizeSelect = (size) => {
    pushUndo(canvasState);
    setCanvasState({
      size: size,
      pixels: Array.from({ length: size * size }, () => DEFAULT_COLOR),
    });
    setIsCanvasMenuOpen(false);
  };
  const handleShare = async () => {
    if (!user?._id) {
      toast.error("No user found or user is not logged in!");
      return;
    }
    let missingFields = [];
    if (!title) missingFields.push("title");
    if (!selectedCategory) missingFields.push("category");
    const nonWhitePixels = pixels
      .map((color, index) => ({
        x: index % canvasSize,
        y: Math.floor(index / canvasSize),
        color,
      }))
      .filter((pixel) => pixel.color !== DEFAULT_COLOR);
    if (nonWhitePixels.length === 0) {
      missingFields.push("drawing");
    }
    if (missingFields.length > 0) {
      toast.error(`Ups, you forgot to add: ${missingFields.join(", ")}`);
      return;
    }
    try {
      const response = await fetch("/api/pixel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          pixels: nonWhitePixels,
          canvasSize,
          title,
          category: selectedCategory,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        toast.error("Failed to share pixel art: " + errorData.error);
        return;
      }
      toast.success(
        "Pixel art shared successfully! It will be visible after approval."
      );
    } catch (error) {
      toast.error("An error occurred while sharing pixel art.");
    }
  };
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center bg-gradient-to-r from-black to-red-500 p-4"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <header className="mt-8 mb-4 text-center text-white">
        <h1 className="text-4xl font-bold mb-2">
          Welcome to the <span className="font-pixelify">Drawing</span> page
        </h1>
        <p className="max-w-xl mx-auto">
          Click or drag over the squares to create your own pixel art! Use the
          brush or eraser, and choose from the palette to add color.
          <span className="text-gray-400 flex items-start">
            <IoIosInformationCircleOutline size={27} /> The pixel area may be
            harmful to your eye health if you look at it for too long.
          </span>
        </p>
      </header>
      <div className="w-[91%]">
        <div className="mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            maxLength={30}
            className="font-bold text-4xl text-start border-none text-white focus:outline-none bg-transparent px-3 py-2 rounded-md w-[40rem]"
          />
        </div>
        <div className="relative inline-block">
          <button
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="bg-transparent border border-gray-500 text-white py-2 px-3 rounded-md ml-4 flex items-center gap-2"
          >
            {selectedCategory || "Select Category"}
          </button>
          <div
            className={`absolute top-0 left-full ml-2 border-red-500 border text-white z-50 rounded-md shadow-lg transition-all duration-300 ${
              isCategoryOpen
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-0 pointer-events-none"
            }`}
          >
            <ul className="flex flex-row">
              {CATEGORY_OPTIONS.map((cat) => (
                <li
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setIsCategoryOpen(false);
                  }}
                  className={`px-3 py-2 w-44 hover:bg-red-500 cursor-pointer ${
                    selectedCategory === cat ? "bg-red-500" : ""
                  }`}
                >
                  {cat}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="flex w-[91%] gap-4 mt-6">
        <button
          onClick={() => setIsCanvasMenuOpen(!isCanvasMenuOpen)}
          className="bg-gray-800 text-white px-3 py-2 rounded-md"
        >{`Canvas Size: ${canvasSize}`}</button>
        {isCanvasMenuOpen && (
          <div className="absolute bg-gray-800 text-white rounded-md shadow-lg p-2 mt-16 z-50">
            {CANVAS_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => handleCanvasSizeSelect(size)}
                className="block px-4 py-2 hover:bg-gray-700"
              >
                {size}
              </button>
            ))}
          </div>
        )}
        <input
          type="range"
          min="1"
          max="10"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-full"
        />
      </div>
      <div className="flex w-[91%] items-center justify-between mt-2">
        <div className="flex gap-2">
          <button
            onClick={undo}
            className="bg-gray-800 text-white px-3 py-2 rounded-md"
          >
            <FaArrowRotateLeft />
          </button>
          <button
            onClick={redo}
            className="bg-gray-800 text-white px-3 py-2 rounded-md"
          >
            <FaArrowRotateRight />
          </button>
        </div>
        <button
          onClick={() => setShowGrid(!showGrid)}
          className="bg-gray-800 text-white px-3 py-2 rounded-md"
        >
          Toggle Grid
        </button>
        <input
          type="color"
          value={currentColor}
          onChange={(e) => setCurrentColor(e.target.value)}
          className="w-7 h-7 p-0 border border-black"
        />
      </div>
      <div
        className="relative mt-4"
        style={{
          width: "160vmin",
          height: "200vmin",
          maxWidth: "1300px",
          maxHeight: "1200px",
        }}
      >
        <div
          className="grid bg-white/10 p-1 rounded-md shadow-lg"
          style={{
            gridTemplateColumns: `repeat(${canvasSize}, 1fr)`,
            gridTemplateRows: `repeat(${canvasSize}, 1fr)`,
            width: "100%",
            height: "100%",
          }}
        >
          {pixels.map((color, index) => (
            <div
              key={index}
              onMouseDown={() => handleMouseDown(index)}
              onMouseEnter={() => handleMouseEnter(index)}
              style={{
                backgroundColor: color,
                border: showGrid ? "1px solid rgba(51, 51, 51, 0.5)" : "none",
                width: "100%",
                height: "100%",
                cursor: "crosshair",
              }}
            />
          ))}
        </div>
        {isDrawingLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="text-white text-2xl">Changing Canvas...</div>
          </div>
        )}
      </div>
      <div
        className={`absolute right-4 top-20 bg-gray-800 text-white rounded-md shadow-lg p-2 transition-all duration-300 flex flex-col space-y-2 z-20 ${
          isToolboxOpen
            ? "max-h-[300px] opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <button
          className={`flex items-center gap-1 px-2 py-2 rounded-md transition hover:bg-gray-700 ${
            tool === "brush" ? "bg-gray-700" : ""
          }`}
          onClick={() => handleToolSelection("brush")}
        >
          <span>{BRUSH_ICON}</span>
          <span>Brush</span>
        </button>
        <button
          className={`flex items-center gap-1 px-2 py-2 rounded-md transition hover:bg-gray-700 ${
            tool === "eraser" ? "bg-gray-700" : ""
          }`}
          onClick={() => handleToolSelection("eraser")}
        >
          <span>{ERASER_ICON}</span>
          <span>Eraser</span>
        </button>
        <button
          className="flex items-center gap-1 px-2 py-2 rounded-md transition hover:bg-red-700"
          onClick={() => setShowConfirmModal(true)}
        >
          <span>{TRASH_ICON}</span>
          <span>Clear</span>
        </button>
        {tool === "brush" && isPaletteOpen && (
          <div className="bg-gray-700 p-2 rounded-md grid grid-cols-5 gap-2 mt-2">
            {COLOR_PALETTE.map((c) => (
              <div
                key={c}
                className="w-6 h-6 rounded-full border-2 border-black cursor-pointer hover:scale-110 transition-transform"
                style={{ backgroundColor: c }}
                onClick={() => handleColorSelect(c)}
              />
            ))}
          </div>
        )}
      </div>
      <button
        onClick={handleToolboxToggle}
        className="absolute top-4 right-4 text-white bg-gray-800 hover:bg-gray-700 focus:outline-none p-3 rounded-full transition-transform duration-300 shadow-md"
      >
        🛠️
      </button>
      <div className="flex items-center flex-col gap-2 mt-6">
        <button
          className="bg-blue-600 p-2 rounded-xl text-white hover:bg-red-500 duration-200"
          onClick={handleShare}
        >
          Share
        </button>
        <span className="text-gray-400 text-sm flex items-center gap-1">
          <IoIosInformationCircleOutline />
          Wait for admin approval after sharing.
        </span>
      </div>
      {showConfirmModal && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 text-white rounded-md shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4">Clear Canvas</h2>
            <p className="mb-6">
              Are you sure you want to clear the entire canvas?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 rounded-md border border-gray-500 hover:bg-gray-700 transition"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition"
                onClick={handleClearCanvas}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
      <footer className="mt-8 text-white text-center">
        <p className="text-sm opacity-80">
          Have fun drawing, and don't forget to share your art!
        </p>
      </footer>
    </div>
  );
}
