"use client";
import React, { useEffect, useState, useRef } from "react";
import { FaRegHeart } from "react-icons/fa6";
import { FcLike } from "react-icons/fc";
import { useSelector } from "react-redux";
import Link from "next/link";
import { fetchLikedArts, handleLike } from "@/app/utils/likes";
import { PiWarningBold } from "react-icons/pi";
import ReportModal from "@/app/utils/report";
import { MdBookmarkBorder } from "react-icons/md";
import { FaBookmark } from "react-icons/fa";
import { addFavorite, removeFavorite } from "@/app/utils/save";

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
                  onClick={() => setSelectedArt(art)}
                />
                <div className="mt-4">
                  <div className="flex items-center">
                    <img
                      className="w-10 h-10 rounded-full border-2 border-white"
                      src={art.userId.profilePhoto || "/defaultpicture.jpg"}
                      alt={art.userId.username}
                    />
                    <div className="ml-3">
                      <Link href={`/dashboard/profile/${art.userId?._id}`}>
                        <p className="text-white font-semibold hover:text-yellow-300 transition-colors truncate">
                          {art.userId.username}
                        </p>
                      </Link>
                      <p className="text-gray-400 text-sm">
                        {art.title || "Untitled"}
                      </p>
                    </div>
                  </div>
                  <div className="w-full flex items-center justify-end mt-4">
                    {likedArts[art._id] ? (
                      <FcLike
                        className="text-red-500 text-lg cursor-pointer hover:scale-125 transition-transform"
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
                      />
                    ) : (
                      <FaRegHeart
                        className="text-red-500 text-lg cursor-pointer hover:scale-125 transition-transform"
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
                      />
                    )}
                    <span className="text-white ml-2 mt-0.5">
                      {likeCounts[art._id] || 0}
                    </span>
                    <button
                      className="ml-4"
                      onClick={() => handleFavorite(art)}
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                      {favorites[art._id] ? (
                        <FaBookmark className="text-md text-white" />
                      ) : (
                        <MdBookmarkBorder className="text-xl text-white" />
                      )}
                      </div>
                    </button>
                    <button
                      className="text-white hover:text-yellow-400 transition-colors ml-auto"
                      onClick={() => openReportModal(art)}
                    >
                      <PiWarningBold className="text-xl" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedArt && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setSelectedArt(null)}
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
                onClick={() => setSelectedArt(null)}
              >
                Close
              </button>
            </div>
          </div>
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
