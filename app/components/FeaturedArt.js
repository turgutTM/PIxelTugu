"use client";
import React, { useState, useEffect } from "react";
import CanvasCell from "@/app/components/CanvasCell";
import { FcLike, FcLikePlaceholder } from "react-icons/fc";
import { MdBookmarkBorder } from "react-icons/md";
import { FaBookmark } from "react-icons/fa";
import { fetchLikedArts, handleLike } from "@/app/utils/likes";
import { addFavorite, removeFavorite } from "@/app/utils/save";
import ReportModal from "@/app/utils/report";

const FeaturedArt = ({ winnerArt, monthlyArts, currentMonthlyArtIndex, onSelect, user }) => {
  const [likedArts, setLikedArts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [favorites, setFavorites] = useState({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const artToShow = winnerArt ? winnerArt : monthlyArts.length > 0 ? monthlyArts[currentMonthlyArtIndex] : null;

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
            const artId = typeof fav.pixelArtId === "object" ? fav.pixelArtId._id : fav.pixelArtId;
            favs[artId] = true;
          });
          setFavorites(favs);
        })
        .catch((err) => console.error(err));
    }
  }, [user]);

  if (!artToShow)
    return <div className="text-gray-300 text-lg">No monthly art or winner found.</div>;

  return (
    <div className="w-full max-w-7xl shadow-2xl bg-gray-900 rounded-lg overflow-hidden">
      <div className="p-4">
        <CanvasCell art={artToShow} onClick={() => onSelect(artToShow)} />
        <div className="flex gap-3 mt-4 items-center">
          <img className="w-14 h-14 rounded-lg" src={artToShow.userId?.profilePhoto || "/defaultpicture.jpg"} alt={artToShow.userId?.username || "Artist"} />
          <div className="flex flex-col text-white gap-1">
            <p className="text-lg font-semibold">{artToShow.userId?.username || "Unknown Artist"}</p>
            <p className="text-sm text-gray-400">{artToShow.title || "Untitled"}</p>
          </div>
        </div>
        <div className="flex items-center mt-4 space-x-4">
          <button
            onClick={() => handleLike(artToShow._id, user, likedArts, setLikedArts, likeCounts, setLikeCounts)}
            className="flex items-center"
          >
            {likedArts[artToShow._id] ? <FcLike className="text-xl" /> : <FcLikePlaceholder className="text-xl" />}
            <span className="text-white ml-1">{likeCounts[artToShow._id] || 0}</span>
          </button>
          <button
            onClick={async () => {
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
            }}
            className="text-white"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              {favorites[artToShow._id] ? <FaBookmark className="w-4 h-4" /> : <MdBookmarkBorder className="w-full h-full" />}
            </div>
          </button>
          <button onClick={() => setShowReportModal(true)} className="text-white">Report</button>
        </div>
      </div>
      <ReportModal
        show={showReportModal}
        reportingArt={artToShow}
        reportReason={reportReason}
        setReportReason={setReportReason}
        closeReportModal={() => setShowReportModal(false)}
        submitReport={async () => {
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
        }}
      />
    </div>
  );
};

export default FeaturedArt;
