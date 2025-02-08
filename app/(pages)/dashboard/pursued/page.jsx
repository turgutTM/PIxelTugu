"use client";
import React, { useEffect, useState, useRef } from "react";
import { FaRegHeart } from "react-icons/fa6";
import { useSelector } from "react-redux";

const Pursue = () => {
  const [arts, setArts] = useState([]);
  const [loading, setLoading] = useState(true);
  const canvasRefs = useRef([]);
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    const fetchArts = async () => {
      try {
        const response = await fetch(`/api/pursued-arts?userId=${user._id}`);
        const data = await response.json();

        if (response.ok) {
          setArts(data.pixelArts || []);
        } else {
          console.error("Error fetching arts:", data.error);
          setArts([]);
        }
      } catch (error) {
        console.error("Failed to fetch arts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArts();
  }, []);

  useEffect(() => {
    arts.forEach((art, index) => {
      if (!art || !canvasRefs.current[index]) return;
      const canvas = canvasRefs.current[index];
      const ctx = canvas.getContext("2d");

      const size = art.canvasSize || 100;
      canvas.width = size;
      canvas.height = size;

      ctx.clearRect(0, 0, size, size);

      art.pixels.forEach(({ x, y, color }) => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      });
    });
  }, [arts]);

  return (
    <div className="bg-gradient-to-r flex flex-col from-black to-red-500 min-h-screen">
      <div className="text-white h-40 flex flex-col items-start ml-20 mt-24">
        <p className="w-72 text-4xl font-semibold">
          <span>Art</span> of the people you follow
        </p>
      </div>

      <div className="px-10 mt-10">
        <p className="font-pixelify text-white text-4xl mb-5">Arts</p>

        {loading ? (
          <p className="text-white text-lg">Loading...</p>
        ) : arts.length === 0 ? (
          <p className="text-gray-400 text-lg">No arts found.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {arts.map((art, index) => (
              <div
                key={art._id}
                className="bg-gray-900 shadow-lg rounded-xl overflow-hidden p-4"
              >
                <canvas
                  ref={(el) => (canvasRefs.current[index] = el)}
                  className="border object-cover border-gray-700 cursor-pointer"
                  style={{
                    width: "100%",
                    height: "200px",
                    backgroundColor: "white",
                    imageRendering: "pixelated",
                  }}
                />

                <div className="mt-4">
                  <div className="flex items-center">
                    <img
                      className="w-10 h-10 rounded-full border-2 border-white"
                      src={art.userId.profilePhoto || "/defaultpicture.jpg"}
                      alt={art.userId.username}
                    />
                    <div className="ml-3">
                      <p className="text-white font-semibold">
                        {art.userId.username}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {art.title || "Untitled"}
                      </p>
                    </div>
                  </div>
                  <div className="w-full flex justify-end mt-2">
                    <FaRegHeart className="text-red-500 text-lg cursor-pointer hover:scale-125 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pursue;
