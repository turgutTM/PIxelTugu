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
import { toast } from "react-toastify";

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
  const [showWinnerArt, setShowWinnerArt] = useState(false);
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
    if (winnerArt) {
      const timer = setTimeout(() => {
        setShowWinnerArt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [winnerArt]);

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
    toast.success("Followed")
    setFollowingUsers((prev) => ({ ...prev, [followingId]: true }));
  };

  const handleUnfollow = async (followingId) => {
    if (!user?._id) return;
    await unfollowUser(user._id, followingId);
    toast.warn("Unfollowed")
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
    <div className="min-h-screen w-full bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 flex flex-col items-center py-12 px-6">
      <div
        ref={headingRef}
        className={`relative z-10 mt-10 text-center transition-all duration-700 ${
          headingVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
        <h1 className="font-playwrite text-white text-4xl lg:text-4xl">
          Art Within You,wherever you go
        </h1>
      </div>
      <div
        ref={featuredRef}
        className={`w-full flex flex-col gap-4 items-center mt-10 transition-all duration-700 ${
          featuredVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
        {winnerArt ? (
          <div className="w-full flex flex-col items-center">
            <p className="text-xl lg:text-2xl font-semibold mb-4 animate-colorCycle">
              {!showWinnerArt ? "Winner is selected" : "Winner"}
              {!showWinnerArt && (
                <TfiCup className="inline ml-2 text-yellow-400 animate-bounce" />
              )}
            </p>
            <div
              className={`w-full max-w-md ${
                showWinnerArt
                  ? "transition-opacity duration-1000 opacity-100"
                  : "opacity-0"
              }`}
            >
              <FeaturedArt
                winnerArt={winnerArt}
                onSelect={setSelectedArt}
                user={user}
              />
            </div>
          </div>
        ) : (
          <>
            <p className="text-white text-xl lg:text-2xl font-semibold mb-4">
              Art of the Month
            </p>
            <FeaturedArt
              monthlyArts={monthlyArts}
              currentMonthlyArtIndex={currentMonthlyArtIndex}
              onSelect={setSelectedArt}
              user={user}
            />
          </>
        )}
      </div>
      <div
        ref={gridTitleRef}
        className={`w-full flex flex-col items-center mt-16 transition-all duration-700 ${
          gridTitleVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
        <h2 className="text-white text-2xl lg:text-3xl font-bold mb-6">
          Explore Creations
        </h2>
        <div style={{ height: "700px", overflowY: "auto", width: gridWidth }}>
          {loading && artworks.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="border-t-4 border-white rounded-full w-12 h-12 animate-spin"></div>
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
              <div className="border-t-4 border-white rounded-full w-8 h-8 animate-spin"></div>
            </div>
          )}
          {!loading && hasMore && (
            <div className="flex justify-center items-center mt-4">
              <button
                onClick={() => setPage((prev) => prev + 1)}
                className="px-4 py-2 bg-white text-black rounded"
                disabled={loading}
              >
                Load More
              </button>
            </div>
          )}
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
