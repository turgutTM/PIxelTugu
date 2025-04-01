"use client";
import React, { useState, useEffect } from "react";
import CanvasCell from "@/app/components/CanvasCell";
import {
  FaHeart,
  FaRegHeart,
  FaBookmark,
  FaShare,
  FaEllipsisV,
} from "react-icons/fa";
import { MdBookmarkBorder, MdOutlineReport } from "react-icons/md";
import { fetchLikedArts, handleLike } from "@/app/utils/likes";
import { addFavorite, removeFavorite } from "@/app/utils/save";
import ReportModal from "@/app/utils/report";
import Link from "next/link";

const FeaturedArt = ({
  winnerArt,
  monthlyArts,
  currentMonthlyArtIndex,
  onSelect,
  user,
}) => {
  const [likedArts, setLikedArts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [favorites, setFavorites] = useState({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const artToShow = winnerArt
    ? winnerArt
    : monthlyArts.length > 0
    ? monthlyArts[currentMonthlyArtIndex]
    : null;

  useEffect(() => {
    if (user && artToShow) {
      fetchLikedArts(user._id, setLikedArts, setLikeCounts);
    }
  }, [user, artToShow]);

  useEffect(() => {
    if (user?._id) {
      fetch(`/api/favorites?userId=${user._id}`)
        .then((res) => res.json())
        .then((data) => {
          const favs = {};
          data?.favorites?.forEach((fav) => {
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

  const handleFavorite = async () => {
    if (!user?._id || !artToShow) return;

    if (favorites[artToShow._id]) {
      await removeFavorite(user._id, artToShow._id);
      setFavorites((prev) => {
        const newFav = { ...prev };
        delete newFav[artToShow._id];
        return newFav;
      });
    } else {
      await addFavorite(user._id, artToShow._id);
      setFavorites((prev) => ({ ...prev, [artToShow._id]: true }));
    }
  };

  const submitReport = async () => {
    if (!user?._id || !reportReason) return;
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          pixelArtId: artToShow._id,
          reason: reportReason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "");
      setShowReportModal(false);
      setReportReason("");
    } catch (error) {
      console.error("Report failed", error);
    }
  };

  if (!artToShow)
    return (
      <div className="w-full max-w-7xl bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl p-12 flex flex-col items-center justify-center">
        <div className="w-24 h-24 border-4 border-gray-700 rounded-lg mb-6"></div>
        <p className="text-gray-400 text-xl font-medium mb-2">
          No Featured Artwork
        </p>
        <p className="text-gray-500 text-center max-w-md">
          Check back later for this month's featured pixel art creations
        </p>
      </div>
    );

  return (
    <div className="w-full max-w-7xl bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950 rounded-xl shadow-2xl overflow-hidden border border-gray-800">
      <div className="relative">
        {winnerArt && (
          <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold py-1 px-4 rounded-full shadow-lg flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 1l2.928 6.377 6.541.95-4.735 4.608 1.12 6.515L10 16.304l-5.853 3.146 1.12-6.515L.53 8.327l6.541-.95L10 1z"
                clipRule="evenodd"
              />
            </svg>
            Winner
          </div>
        )}

        <div className="relative group overflow-hidden">
          <div className="w-full h-full bg-black bg-opacity-0 absolute inset-0 z-10 group-hover:bg-opacity-20 transition-all duration-300"></div>
          <div onClick={() => onSelect(artToShow)} className="cursor-pointer">
            <CanvasCell
              art={artToShow}
              className="w-full transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start">
          <Link href={`/dashboard/profile/${artToShow.userId?._id}`}>
            <div className="flex items-center group">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse group-hover:animate-none"></div>
                <img
                  className="w-16 h-16 rounded-full border-2 border-white relative object-cover"
                  src={artToShow.userId?.profilePhoto || "/defaultpicture.jpg"}
                  alt={artToShow.userId?.username || "Artist"}
                />
              </div>
              <div className="ml-4">
                <h3 className="text-white text-xl font-bold group-hover:text-purple-400 transition-colors">
                  {artToShow.userId?.username || "Unknown Artist"}
                </h3>
                <p className="text-gray-400 font-medium">
                  {artToShow.title || "Untitled Masterpiece"}
                </p>
              </div>
            </div>
          </Link>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-400 hover:text-white p-2 rounded-full transition-colors"
            >
              <FaEllipsisV />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-2 z-20 border border-gray-700">
                <button
                  onClick={() => {
                    setShowReportModal(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 flex items-center"
                >
                  <MdOutlineReport className="mr-2" />
                  Report Artwork
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 flex items-center"
                  onClick={() => setShowMenu(false)}
                >
                  <FaShare className="mr-2" />
                  Share
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={() =>
                handleLike(
                  artToShow._id,
                  user,
                  likedArts,
                  setLikedArts,
                  likeCounts,
                  setLikeCounts
                )
              }
              className="flex items-center group"
            >
              {likedArts[artToShow._id] ? (
                <FaHeart className="text-2xl text-red-500 group-hover:scale-110 transition-transform" />
              ) : (
                <FaRegHeart className="text-2xl text-gray-400 group-hover:text-red-500 group-hover:scale-110 transition-all" />
              )}
              <span className="ml-2 text-gray-300 font-medium">
                {likeCounts[artToShow._id] || 0}
              </span>
            </button>

            {/* Bookmark Button */}
            <button
              onClick={handleFavorite}
              className="flex items-center group"
            >
              {favorites[artToShow._id] ? (
                <FaBookmark className="text-xl text-yellow-500 group-hover:scale-110 transition-transform" />
              ) : (
                <MdBookmarkBorder className="text-2xl text-gray-400 group-hover:text-yellow-500 group-hover:scale-110 transition-all" />
              )}
              <span className="ml-2 text-gray-300 font-medium">Save</span>
            </button>
          </div>

          {/* View Full Button */}
          <button
            onClick={() => onSelect(artToShow)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-full transition-colors"
          >
            View Full
          </button>
        </div>
      </div>

      <ReportModal
        show={showReportModal}
        reportingArt={artToShow}
        reportReason={reportReason}
        setReportReason={setReportReason}
        closeReportModal={() => {
          setShowReportModal(false);
          setReportReason("");
        }}
        submitReport={submitReport}
      />
    </div>
  );
};

export default FeaturedArt;
