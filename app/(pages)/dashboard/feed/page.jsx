"use client";
import React, { useEffect, useState } from "react";
import { FixedSizeGrid as Grid } from "react-window";
import { useInView } from "react-intersection-observer";
import { useSelector } from "react-redux";
import ArtCard from "@/app/components/ArtCard";
import FeaturedArt from "@/app/components/FeaturedArt";
import ArtModal from "@/app/components/ArtModal";
import ReportModal from "@/app/utils/report";
import { fetchMonthlyArts } from "@/app/utils/monthlyarts";
import { fetchLikedArts, handleLike } from "@/app/utils/likes";
import { getFollowingList, followUser, unfollowUser } from "@/app/utils/follow";
import { addFavorite, removeFavorite } from "@/app/utils/save";
import { TfiCup } from "react-icons/tfi";
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
  const { ref: sentinelRef, inView: sentinelVisible } = useInView({
    threshold: 0.1,
  });
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [likedArtsFetched, setLikedArtsFetched] = useState(false);
  const [artworks, setArtworks] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [likedArts, setLikedArts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [selectedArt, setSelectedArt] = useState(null);
  const [followingUsers, setFollowingUsers] = useState({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingArt, setReportingArt] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [favorites, setFavorites] = useState({});
  const [winnerArt, setWinnerArt] = useState(null);
  const [monthlyArts, setMonthlyArts] = useState([]);
  const [currentMonthlyArtIndex, setCurrentMonthlyArtIndex] = useState(0);
  const user = useSelector((state) => state.user.user);
  useEffect(() => {
    const fetchMonthly = async () => {
      try {
        const data = await fetchMonthlyArts();
        if (data.arts.length === 1 && data.arts[0].winner) {
          setWinnerArt(data.arts[0]);
        } else {
          setMonthlyArts(data.arts);
        }
      } catch (error) {
        console.error("Error fetching monthly arts:", error);
      }
    };
    fetchMonthly();
  }, []);
  useEffect(() => {
    if (monthlyArts.length > 1) {
      const interval = setInterval(() => {
        setCurrentMonthlyArtIndex((prev) => (prev + 1) % monthlyArts.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [monthlyArts]);
  useEffect(() => {
    const fetchArtworks = async () => {
      if (!hasMore) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/pixel?page=${page}`);
        if (!response.ok) throw new Error("Failed to fetch artworks");
        const data = await response.json();
        if (data.length === 0) {
          setHasMore(false);
        } else {
          setArtworks((prev) => {
            const existingIds = new Set(prev.map((art) => art._id));
            const newUniqueArts = data.filter(
              (art) => !existingIds.has(art._id)
            );
            return [...prev, ...newUniqueArts];
          });
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
      if (page === 1) setInitialLoadComplete(true);
    };
    fetchArtworks();
  }, [page]);
  useEffect(() => {
    if (sentinelVisible && initialLoadComplete && hasMore && !loading)
      setPage((prev) => prev + 1);
  }, [sentinelVisible, initialLoadComplete, hasMore, loading]);
  useEffect(() => {
    if (user?._id && !likedArtsFetched) {
      fetchLikedArts(user._id, setLikedArts, setLikeCounts);
      setLikedArtsFetched(true);
    }
  }, [user?._id, likedArtsFetched]);
  useEffect(() => {
    const loadFollowing = async () => {
      if (!user?._id) return;
      const followingMap = await getFollowingList(user._id);
      setFollowingUsers(followingMap);
    };
    loadFollowing();
  }, [user?._id]);
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
  }, [user?._id]);
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
  const handleFavorite = (art) => {
    if (!user?._id) return;
    const artId = art._id;
    const isFavorited = favorites[artId];
    setFavorites((prev) =>
      isFavorited ? { ...prev, [artId]: false } : { ...prev, [artId]: true }
    );
    if (isFavorited) {
      removeFavorite(user._id, artId).catch(() => {
        setFavorites((prev) => ({ ...prev, [artId]: true }));
      });
    } else {
      addFavorite(user._id, artId).catch(() => {
        setFavorites((prev) => {
          const newState = { ...prev };
          delete newState[artId];
          return newState;
        });
      });
    }
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
      if (!res.ok) throw new Error(data.error || "");
      closeReportModal();
    } catch (error) {
      alert(error.message);
    }
  };
  const columnCount = 3;
  const rowCount = Math.ceil(artworks.length / columnCount);
  const gridWidth =
    typeof window !== "undefined" ? window.innerWidth * 0.9 : 900;
  const columnWidth = gridWidth / columnCount;
  const rowHeight = 400;
  const renderCell = ({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= artworks.length) return null;
    const art = artworks[index];
    return (
      <div key={art._id} style={style}>
        <ArtCard
          art={art}
          onSelect={setSelectedArt}
          likedArts={likedArts}
          handleLike={(id) =>
            handleLike(
              id,
              user,
              likedArts,
              setLikedArts,
              likeCounts,
              setLikeCounts
            )
          }
          likeCounts={likeCounts}
          user={user}
          followingUsers={followingUsers}
          handleFollow={handleFollow}
          handleUnfollow={handleUnfollow}
          openReportModal={openReportModal}
          favorites={favorites}
          handleFavorite={handleFavorite}
        />
      </div>
    );
  };
  return (
    <div className="min-h-screen w-full bg-gradient-to-bl from-gray-900 via-black to-red-500 flex flex-col items-center py-10 px-4 lg:px-8">
      <div
        ref={headingRef}
        className={`relative z-10 mt-8 text-center transition-all duration-700 ${
          headingVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
        <p className="font-fingerpaint text-white text-3xl lg:text-5xl drop-shadow-lg">
          Art is always within you, wherever you are.
        </p>
      </div>

      <div
        ref={featuredRef}
        className={`w-full flex flex-col gap-1 items-center mt-12 transition-all duration-700 ${
          featuredVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
        <p className="text-white flex items-center text-lg lg:text-xl uppercase font-semibold mb-4">
          {winnerArt ? (
            <>
              Winner <TfiCup className="ml-2" />
            </>
          ) : (
            "Art of the Month"
          )}
        </p>
        <FeaturedArt
          winnerArt={winnerArt}
          monthlyArts={monthlyArts}
          currentMonthlyArtIndex={currentMonthlyArtIndex}
          onSelect={setSelectedArt}
          user={user}
        />
      </div>
      <div
        ref={gridTitleRef}
        className={`w-full flex flex-col items-center mt-20 transition-all duration-700 ${
          gridTitleVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
        <p className="text-white text-xl lg:text-2xl font-bold mb-6 drop-shadow-lg">
          Explore what other people did
        </p>
        <div style={{ height: "700px", overflowY: "auto", width: gridWidth }}>
          {loading && artworks.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
            </div>
          ) : (
            <Grid
              columnCount={columnCount}
              columnWidth={columnWidth}
              height={700}
              rowCount={rowCount}
              rowHeight={rowHeight}
              width={gridWidth}
            >
              {renderCell}
            </Grid>
          )}
          {loading && artworks.length > 0 && (
            <div className="flex justify-center items-center mt-4">
              <div className="border-t-4 border-blue-500 rounded-full w-8 h-8 animate-spin"></div>
            </div>
          )}
          <div ref={sentinelRef}></div>
        </div>
      </div>
      {selectedArt && (
        <ArtModal
          selectedArt={selectedArt}
          onClose={() => setSelectedArt(null)}
        />
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
}
