"use client";
import React, { useEffect, useState, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { HiOutlinePaintBrush } from "react-icons/hi2";
import { FcLikePlaceholder, FcLike } from "react-icons/fc";
import { IoMdAddCircleOutline } from "react-icons/io";
import { useSelector } from "react-redux";
import Link from "next/link";
import { fetchLikedArts, handleLike } from "@/app/utils/likes";
import { getFollowingList, followUser, unfollowUser } from "@/app/utils/follow";
import { RiUserUnfollowLine } from "react-icons/ri";
import { PiWarningBold } from "react-icons/pi";

export default function Feed() {
  const { ref: headingRef, inView: headingVisible } = useInView({
    triggerOnce: true,
  });
  const { ref: featuredRef, inView: featuredVisible } = useInView({
    triggerOnce: true,
  });
  const { ref: gridTitleRef, inView: gridTitleVisible } = useInView({
    triggerOnce: true,
  });

  const [artworks, setArtworks] = useState([]);
  const [likedArts, setLikedArts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [selectedArt, setSelectedArt] = useState(null);
  const [followingUsers, setFollowingUsers] = useState({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingArt, setReportingArt] = useState(null);
  const [reportReason, setReportReason] = useState("");

  const user = useSelector((state) => state.user.user);
  const canvasRefs = useRef([]);
  const modalCanvasRef = useRef(null);

  useEffect(() => {
    const fetchArtworks = async () => {
      const response = await fetch("/api/pixel");
      if (!response.ok) throw new Error("Error fetching artworks");
      const data = await response.json();
      setArtworks(data);
      canvasRefs.current = data.map(() => React.createRef());
    };
    fetchArtworks();
  }, []);

  useEffect(() => {
    if (user?._id) {
      fetchLikedArts(user._id, setLikedArts, setLikeCounts);
    }
  }, [user]);

  useEffect(() => {
    artworks.forEach((art, index) => {
      const canvas = canvasRefs.current[index];
      if (!art || !canvas) return;
      const ctx = canvas.getContext("2d");
      const size = art.canvasSize || 110;
      canvas.width = size;
      canvas.height = size;
      ctx.clearRect(0, 0, size, size);
      art.pixels.forEach(({ x, y, color }) => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      });
    });
  }, [artworks]);

  useEffect(() => {
    if (selectedArt && modalCanvasRef.current) {
      const ctx = modalCanvasRef.current.getContext("2d");
      const modalSize = 300;
      modalCanvasRef.current.width = modalSize;
      modalCanvasRef.current.height = modalSize;
      ctx.clearRect(0, 0, modalSize, modalSize);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, modalSize, modalSize);
      const originalSize = selectedArt.canvasSize || 110;
      const scale = modalSize / originalSize;
      selectedArt.pixels.forEach(({ x, y, color }) => {
        ctx.fillStyle = color;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      });
    }
  }, [selectedArt]);

  useEffect(() => {
    const loadFollowing = async () => {
      if (!user?._id) return;
      const followingMap = await getFollowingList(user._id);
      setFollowingUsers(followingMap);
    };
    loadFollowing();
  }, [user]);

  const handleFollow = async (followingId) => {
    if (!user?._id) return;
    await followUser(user._id, followingId);
    setFollowingUsers((prev) => ({ ...prev, [followingId]: true }));
  };

  const handleUnfollow = async (followingId) => {
    if (!user?._id) return;
    await unfollowUser(user._id, followingId);
    setFollowingUsers((prev) => {
      const updated = { ...prev };
      delete updated[followingId];
      return updated;
    });
  };

  const openReportModal = (art) => {
    setReportingArt(art);
    setShowReportModal(true);
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setReportingArt(null);
    setReportReason("");
  };

  const submitReport = () => {
    console.log("Reported Artwork:", reportingArt);
    console.log("Report Reason:", reportReason);
    closeReportModal();
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-bl from-gray-900 via-black to-red-500 flex flex-col items-center py-10 px-4 lg:px-8">
      <div
        ref={headingRef}
        className={`relative z-10 mt-8 text-center transition-all duration-700 ${
          headingVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <p className="font-fingerpaint text-white text-3xl lg:text-5xl drop-shadow-lg">
          Art is always within you, wherever you are.
        </p>
      </div>
      <div
        ref={featuredRef}
        className={`w-full flex flex-col gap-1 items-center mt-12 transition-all duration-700 ${
          featuredVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <p className="text-white flex text-lg lg:text-xl items-center uppercase font-semibold mb-4">
          Art of the Month
          <HiOutlinePaintBrush className="ml-2 text-xl lg:text-2xl" />
        </p>
        <div className="w-full max-w-4xl shadow-2xl bg-gray-900 rounded-lg overflow-hidden">
          <img
            className="w-full h-64 object-cover lg:h-96"
            src="/starry-night.jpg"
            alt="Art of the Month"
          />
        </div>
      </div>
      <div
        ref={gridTitleRef}
        className={`w-full flex flex-col items-center mt-12 transition-all duration-700 ${
          gridTitleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <p className="text-white text-xl lg:text-2xl font-bold mb-6 drop-shadow-lg">
          Explore what other people did
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full lg:w-[90%]">
          {artworks.map((art, index) => (
            <div
              key={art._id}
              className="relative group bg-gradient-to-bl from-gray-800 via-gray-900 to-black rounded-xl shadow-md flex flex-col p-4 hover:scale-[1.02] transition-transform duration-300 hover:shadow-xl"
            >
              <canvas
                ref={(el) => (canvasRefs.current[index] = el)}
                className="w-full h-48 border border-gray-600 rounded-lg cursor-pointer bg-white"
                style={{ imageRendering: "pixelated" }}
                onClick={() => setSelectedArt(art)}
              />
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-white line-clamp-1">
                  {art.title || "Untitled"}
                </h3>
                <div className="flex items-center gap-3 mt-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-400">
                    <img
                      className="w-full h-full object-cover"
                      src={art.userId?.avatar || "/defaultpicture.jpg"}
                      alt={art.userId?.username || "User"}
                    />
                  </div>
                  <div>
                    <Link href={`/dashboard/profile/${art.userId?._id}`}>
                      <p className="text-white text-base font-semibold hover:text-yellow-300 transition-colors truncate">
                        {art.userId?.username || "Unknown Artist"}
                      </p>
                    </Link>
                    <p className="text-gray-400 text-sm italic">
                      {art.userId?.profession || "No Profession"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center mt-4 space-x-3">
                  <div className="flex items-center space-x-1">
                    {likedArts[art._id] ? (
                      <FcLike
                        className="text-xl cursor-pointer hover:scale-110 transition-transform"
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
                      <FcLikePlaceholder
                        className="text-xl cursor-pointer hover:scale-110 transition-transform"
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
                    <span className="text-white">
                      {likeCounts[art._id] || 0}
                    </span>
                  </div>
                  {user &&
                    art.userId &&
                    user._id !== art.userId._id &&
                    (followingUsers[art.userId._id] ? (
                      <button
                        onClick={() => handleUnfollow(art.userId._id)}
                        className="flex items-center px-3 py-1 rounded-md text-sm text-white hover:text-red-500 transition-all duration-300"
                      >
                        <RiUserUnfollowLine className="text-lg" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFollow(art.userId._id)}
                        className="flex items-center px-3 py-1 rounded-md text-sm text-white hover:text-green-500 transition-all duration-300"
                      >
                        <IoMdAddCircleOutline className="text-lg" />
                      </button>
                    ))}
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
              className="block mx-auto border border-gray-300"
            />
            <button
              className="bg-red-500 text-white mt-4 px-4 py-2 rounded w-full hover:bg-red-600 transition-colors"
              onClick={() => setSelectedArt(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {showReportModal && reportingArt && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={closeReportModal}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Report Artwork
            </h2>
            <p className="text-gray-600 mb-4">
              Why are you reporting{" "}
              <span className="font-semibold">
                {reportingArt.title || "this artwork"}
              </span>
              ?
            </p>
            <div className="flex flex-col gap-2 mb-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  className="form-radio text-red-500"
                  name="reportReason"
                  value="Spam"
                  onChange={(e) => setReportReason(e.target.value)}
                />
                <span className="text-gray-800">Spam or Advertisement</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  className="form-radio text-red-500"
                  name="reportReason"
                  value="Harassment"
                  onChange={(e) => setReportReason(e.target.value)}
                />
                <span className="text-gray-800">Harassment or Hate Speech</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  className="form-radio text-red-500"
                  name="reportReason"
                  value="Nudity"
                  onChange={(e) => setReportReason(e.target.value)}
                />
                <span className="text-gray-800">Explicit Nudity or Content</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  className="form-radio text-red-500"
                  name="reportReason"
                  value="Other"
                  onChange={(e) => setReportReason(e.target.value)}
                />
                <span className="text-gray-800">Other</span>
              </label>
            </div>
            <div className="flex justify-end gap-4">
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                onClick={closeReportModal}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                onClick={submitReport}
                disabled={!reportReason}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
