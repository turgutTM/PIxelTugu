"use client";
import React, { useEffect, useState, useRef } from "react";
import { FaRegHeart, FaHeart, FaBookmark } from "react-icons/fa";
import { MdBookmarkBorder, MdReport } from "react-icons/md";
import { useSelector } from "react-redux";
import Link from "next/link";
import { fetchLikedArts, handleLike } from "@/app/utils/likes";
import ReportModal from "@/app/utils/report";
import { addFavorite, removeFavorite } from "@/app/utils/save";
import { motion } from "framer-motion";

const Pursue = () => {
  const [arts, setArts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedArts, setLikedArts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [favorites, setFavorites] = useState({});
  const [selectedArt, setSelectedArt] = useState(null);
  const canvasRefs = useRef([]);
  const modalCanvasRef = useRef(null);
  const user = useSelector((state) => state.user.user);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingArt, setReportingArt] = useState(null);
  const [reportReason, setReportReason] = useState("");

  useEffect(() => {
    const fetchArts = async () => {
      try {
        const response = await fetch(`/api/pursued-arts?userId=${user._id}`);
        const data = await response.json();
        if (response.ok) {
          setArts(data.pixelArts || []);
        } else {
          setArts([]);
        }
      } catch (error) {
        console.error("Failed to fetch arts:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchArts();
  }, [user]);

  useEffect(() => {
    if (user?._id) {
      fetchLikedArts(user._id, setLikedArts, setLikeCounts);
    }
  }, [user]);

  useEffect(() => {
    if (user?._id) {
      fetch(`/api/favorites?userId=${user._id}`)
        .then((res) => res.json())
        .then((data) => {
          const favs = {};
          data?.favorites?.forEach((fav) => {
            if (!fav.pixelArtId) return;
            const artId =
              typeof fav.pixelArtId === "object"
                ? fav.pixelArtId._id
                : fav.pixelArtId;
            favs[artId] = true;
          });
          setFavorites(favs);
        })
        .catch((err) => console.error(err));
    }
  }, [user]);

  useEffect(() => {
    arts.forEach((art, index) => {
      if (!art || !canvasRefs.current[index]) return;
      const canvas = canvasRefs.current[index];
      const ctx = canvas.getContext("2d");
      const size = art.canvasSize || 100;
      canvas.width = size;
      canvas.height = size;
      ctx.clearRect(0, 0, size, size);
      ctx.imageSmoothingEnabled = false;
      art.pixels.forEach(({ x, y, color }) => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      });
    });
  }, [arts]);

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

  const openReportModal = (art) => {
    setReportingArt(art);
    setShowReportModal(true);
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setReportingArt(null);
    setReportReason("");
  };

  const submitReport = async () => {
    if (!user?._id || !reportingArt || !reportReason) return;
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          pixelArtId: reportingArt._id,
          reason: reportReason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to report artwork");
      closeReportModal();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleFavorite = async (art) => {
    if (!user?._id) return;
    const artId = art._id;
    if (favorites[artId]) {
      setFavorites((prev) => {
        const newState = { ...prev };
        delete newState[artId];
        return newState;
      });
      try {
        await removeFavorite(user._id, artId);
      } catch (error) {
        console.error(error);
      }
    } else {
      setFavorites((prev) => ({ ...prev, [artId]: true }));
      try {
        await addFavorite(user._id, artId);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900 via-black to-red-900 min-h-screen pb-20">
      <div className="relative overflow-hidden h-80">
        <div className="absolute inset-0 bg-black opacity-60 z-10"></div>
        <div className="absolute inset-0 bg-[url('/pixel-art-banner.jpg')] bg-cover bg-center"></div>
        <div className="relative z-20 h-full flex flex-col justify-center px-12 md:px-20">
          <h1 className="text-white text-5xl md:text-6xl font-pixelify tracking-wider mb-2">
            <span className="text-red-500">Pixel</span> Gallery
          </h1>
          <p className="text-gray-200 text-xl md:text-2xl max-w-2xl">
            Discover creative pixel art from people you follow
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 -mt-16 relative z-30">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500"></div>
          </div>
        ) : arts.length === 0 ? (
          <div className="bg-gray-900 bg-opacity-80 rounded-xl p-12 text-center">
            <img
              src="/empty-gallery.svg"
              alt="No arts found"
              className="w-40 h-40 mx-auto mb-6 opacity-60"
            />
            <p className="text-gray-300 text-xl mb-4">Your gallery is empty</p>
            <p className="text-gray-400">
              Follow artists to see their pixel creations here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {arts.map((art, index) => (
              <motion.div
                key={art._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="p-4">
                  <div className="bg-white rounded-xl overflow-hidden">
                    <canvas
                      ref={(el) => (canvasRefs.current[index] = el)}
                      className="w-full cursor-pointer"
                      onClick={() => setSelectedArt(art)}
                      style={{
                        height: "220px",
                        backgroundColor: "white",
                        imageRendering: "pixelated",
                      }}
                    />
                  </div>

                  <div className="mt-4 flex items-center">
                    <Link href={`/dashboard/profile/${art.userId?._id}`}>
                      <div className="flex items-center group">
                        <img
                          className="w-12 h-12 rounded-full border-2 border-red-500 object-cover"
                          src={art.userId.profilePhoto || "/defaultpicture.jpg"}
                          alt={art.userId.username}
                        />
                        <div className="ml-3">
                          <p className="text-white font-medium group-hover:text-red-400 transition-colors">
                            {art.userId.username}
                          </p>
                          <p className="text-gray-400 text-sm truncate max-w-xs">
                            {art.title || "Untitled"}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() =>
                          handleLike(
                            art._id,
                            user,
                            likedArts,
                            setLikedArts,
                            likeCounts,
                            setLikeCounts
                          )
                        }
                        className="flex items-center space-x-1 group"
                      >
                        {likedArts[art._id] ? (
                          <FaHeart className="text-red-500 text-xl group-hover:scale-110 transition-transform" />
                        ) : (
                          <FaRegHeart className="text-red-400 text-xl group-hover:scale-110 transition-transform" />
                        )}
                        <span className="text-gray-300">
                          {likeCounts[art._id] || 0}
                        </span>
                      </button>

                      <button
                        onClick={() => handleFavorite(art)}
                        className="group"
                      >
                        {favorites[art._id] ? (
                          <FaBookmark className="text-yellow-400 text-lg group-hover:scale-110 transition-transform" />
                        ) : (
                          <MdBookmarkBorder className="text-gray-300 text-xl group-hover:text-yellow-400 group-hover:scale-110 transition-all" />
                        )}
                      </button>
                    </div>

                    <button
                      onClick={() => openReportModal(art)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <MdReport className="text-xl" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {selectedArt && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedArt(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-2xl overflow-hidden max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-gray-900 flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src={selectedArt.userId.profilePhoto || "/defaultpicture.jpg"}
                  className="w-10 h-10 rounded-full border border-red-500"
                  alt={selectedArt.userId.username}
                />
                <div className="ml-3">
                  <p className="text-white font-medium">
                    {selectedArt.userId.username}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {selectedArt.title || "Untitled"}
                  </p>
                </div>
              </div>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setSelectedArt(null)}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="bg-white p-6">
              <canvas
                ref={modalCanvasRef}
                className="block mx-auto shadow-lg"
                style={{ imageRendering: "pixelated" }}
              />
            </div>

            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() =>
                    handleLike(
                      selectedArt._id,
                      user,
                      likedArts,
                      setLikedArts,
                      likeCounts,
                      setLikeCounts
                    )
                  }
                  className="flex items-center space-x-2"
                >
                  {likedArts[selectedArt._id] ? (
                    <FaHeart className="text-red-500 text-xl" />
                  ) : (
                    <FaRegHeart className="text-red-400 text-xl" />
                  )}
                  <span className="text-gray-300">
                    {likeCounts[selectedArt._id] || 0}
                  </span>
                </button>

                <button
                  onClick={() => handleFavorite(selectedArt)}
                  className="flex items-center space-x-2"
                >
                  {favorites[selectedArt._id] ? (
                    <FaBookmark className="text-yellow-400 text-lg" />
                  ) : (
                    <MdBookmarkBorder className="text-gray-300 text-xl" />
                  )}
                  <span className="text-gray-300">Save</span>
                </button>
              </div>

              <button
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-full transition-colors"
                onClick={() => setSelectedArt(null)}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <ReportModal
        show={showReportModal}
        reportingArt={reportingArt}
        reportReason={reportReason}
        setReportReason={setReportReason}
        closeReportModal={closeReportModal}
        submitReport={submitReport}
      />
    </div>
  );
};

export default Pursue;
