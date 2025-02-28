"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { MdDeleteOutline, MdOutlineCoffeeMaker } from "react-icons/md";
import { FiEdit2 } from "react-icons/fi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaBookmark } from "react-icons/fa";
import { MdBookmarkBorder } from "react-icons/md";
import { RiUserFollowLine } from "react-icons/ri";
import EditModal from "@/app/components/EditModal";
import { getFollowingList, followUser, unfollowUser } from "@/app/utils/follow";
import { removeFavorite } from "@/app/utils/save";
import { toast } from "react-toastify";
import { IoBookmark } from "react-icons/io5";
import { LuPaintbrushVertical } from "react-icons/lu";

export default function Profile() {
  const { userId } = useParams();
  const router = useRouter();
  const user = useSelector((state) => state.user.user);
  const [pixelArts, setPixelArts] = useState([]);
  const [favArts, setFavArts] = useState([]);
  const [profileUser, setProfileUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPixelDeleteModal, setShowPixelDeleteModal] = useState(false);
  const [favoriteArt, setFavoriteArt] = useState(null);
  const favoriteCanvasRef = useRef(null);
  const [selectedPixelArtId, setSelectedPixelArtId] = useState(null);
  const [editForm, setEditForm] = useState({
    username: "",
    about: "",
    study: "",
    profilePhoto: "",
    profession: "",
    contact: "",
  });
  const [showLargeModal, setShowLargeModal] = useState(false);
  const [selectedLargePixelArt, setSelectedLargePixelArt] = useState(null);
  const [isFavoritesView, setIsFavoritesView] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const canvasRefs = useRef([]);
  const largeCanvasRef = useRef(null);
  const targetUserId = userId || user?._id;
  useEffect(() => {
    if (!targetUserId) return;
    (async () => {
      try {
        const res = await fetch(`/api/user?userId=${targetUserId}`);
        if (!res.ok) throw new Error("Failed to fetch user data");
        const userData = await res.json();
        setProfileUser(userData);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [targetUserId]);
  useEffect(() => {
    if (!targetUserId) return;
    (async () => {
      try {
        const res = await fetch(`/api/user-arts?userId=${targetUserId}`);
        if (!res.ok) throw new Error("Failed to fetch pixel arts");
        const data = await res.json();
        setPixelArts(data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [targetUserId]);
  useEffect(() => {
    pixelArts.forEach((pixelArt, index) => {
      const canvas = canvasRefs.current[index];
      if (!pixelArt || !canvas) return;
      const ctx = canvas.getContext("2d");
      const size = pixelArt.canvasSize || 110;
      canvas.width = size;
      canvas.height = size;
      ctx.clearRect(0, 0, size, size);
      pixelArt.pixels.forEach(({ x, y, color }) => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      });
    });
  }, [pixelArts]);
  useEffect(() => {
    if (showLargeModal && selectedLargePixelArt && largeCanvasRef.current) {
      const canvas = largeCanvasRef.current;
      const ctx = canvas.getContext("2d");
      const originalSize = selectedLargePixelArt.canvasSize || 110;
      const fixedSize = 600;
      const scale = fixedSize / originalSize;
      canvas.width = fixedSize;
      canvas.height = fixedSize;
      ctx.clearRect(0, 0, fixedSize, fixedSize);
      selectedLargePixelArt.pixels.forEach(({ x, y, color }) => {
        ctx.fillStyle = color;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      });
    }
  }, [showLargeModal, selectedLargePixelArt]);
  useEffect(() => {
    if (favoriteArt && favoriteCanvasRef.current) {
      const ctx = favoriteCanvasRef.current.getContext("2d");
      const size = favoriteArt.canvasSize || 110;
      favoriteCanvasRef.current.width = size;
      favoriteCanvasRef.current.height = size;
      ctx.clearRect(0, 0, size, size);
      favoriteArt.pixels.forEach(({ x, y, color }) => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      });
    }
  }, [favoriteArt]);
  useEffect(() => {
    async function fetchFollowingStatus() {
      if (user && profileUser && user._id !== profileUser._id) {
        const followingMap = await getFollowingList(user._id);
        setIsFollowing(!!followingMap[profileUser._id]);
      }
    }
    fetchFollowingStatus();
  }, [user, profileUser]);
  useEffect(() => {
    if (user && user._id) {
      const fetchFavoriteArt = async () => {
        try {
          const res = await fetch(`/api/show-fav?userId=${targetUserId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.favoriteArt) {
              setFavoriteArt(data.favoriteArt);
            }
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchFavoriteArt();
    }
  }, [user]);
  const openEditModal = () => {
    setEditForm({
      email: profileUser?.email || "",
      username: profileUser?.username || "",
      password: "",
      profilePhoto: profileUser?.profilePhoto || "",
      about: profileUser?.about || "",
      study: profileUser?.study || "",
      profession: profileUser?.profession || "",
      contact: profileUser?.contact || "",
    });
    setShowEditModal(true);
    setShowMenu(false);
  };
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  const saveProfileChanges = async () => {
    try {
      const res = await fetch(`/api/user?userId=${targetUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Failed to update user");
      const updatedUser = await res.json();
      setProfileUser(updatedUser);
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
    }
  };
  const openDeleteModal = () => {
    setShowDeleteModal(true);
    setShowMenu(false);
  };
  const handleCoffeeMakerClick = async () => {
    try {
      const res = await fetch("/api/show-fav", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          pixelArtId: selectedLargePixelArt._id,
        }),
      });
      const data = await res.json();
      toast.success("Cool! Refresh the page to see the art on bottom left");
      console.log("Favorites updated:", data);
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };
  const confirmDelete = async () => {
    try {
      const res = await fetch(`/api/user?userId=${profileUser._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete user");
      localStorage.removeItem("token");
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };
  const confirmPixelDelete = async (id) => {
    try {
      const res = await fetch(`/api/pixel?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete pixel");
      setPixelArts(pixelArts.filter((p) => p._id !== id));
      setShowPixelDeleteModal(false);
    } catch (err) {
      console.error(err);
    }
  };
  const openLargeModalHandler = (pixelArt) => {
    setSelectedLargePixelArt(pixelArt);
    setShowLargeModal(true);
  };
  const loadFavorites = async () => {
    try {
      const res = await fetch(`/api/favorites?userId=${targetUserId}`);
      if (!res.ok) throw new Error("Failed to fetch favorites");
      const data = await res.json();
      const favs = data.favorites.map((fav) => fav.pixelArtId);
      const uniqueFavs = favs.filter(
        (fav, index, self) =>
          index === self.findIndex((t) => t && t._id === fav._id)
      );
      setFavArts(uniqueFavs);
    } catch (err) {
      console.error(err);
    }
  };
  const toggleFavoritesView = () => {
    if (!isFavoritesView) loadFavorites();
    setIsFavoritesView(!isFavoritesView);
  };
  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await unfollowUser(user._id, profileUser._id);
        setIsFollowing(false);
      } else {
        await followUser(user._id, profileUser._id);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleRemoveFavorite = async (pixelArtId) => {
    try {
      await removeFavorite(user._id, pixelArtId);
      setFavArts((prevFavs) =>
        prevFavs.filter((fav) => fav._id !== pixelArtId)
      );
    } catch (error) {
      console.error("Failed to remove favorite", error);
    }
  };
  if (!profileUser)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-black to-red-500 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-gray-400 animate-pulse"></div>
          <div className="w-48 h-6 bg-gray-400 animate-pulse rounded"></div>
          <div className="w-60 h-4 bg-gray-400 animate-pulse rounded"></div>
          <div className="w-40 h-4 bg-gray-400 animate-pulse rounded"></div>
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  return (
    <div className="min-h-screen bg-gradient-to-r from-black to-red-500 text-white p-6 flex gap-4">
      <div className="w-[50rem]">
        <div className="relative w-full bg-gray-900 p-6 rounded-lg shadow-xl flex flex-col gap-2 transform transition-transform duration-300">
          {user?._id === profileUser?._id && (
            <div className="absolute top-4 right-3 cursor-pointer">
              <BsThreeDotsVertical
                size={18}
                onClick={() => setShowMenu(!showMenu)}
                className="hover:text-gray-300 transition duration-200"
              />
              {showMenu && (
                <div className="absolute right-0 mt-2 bg-gray-800 text-white rounded-md shadow-lg w-40 z-10">
                  <button
                    className="flex items-center px-4 py-2 w-full hover:bg-gray-700"
                    onClick={openEditModal}
                  >
                    <FiEdit2 className="mr-2" /> Edit Profile
                  </button>
                  <button
                    className="flex items-center px-4 py-2 w-full text-red-500 hover:bg-gray-700"
                    onClick={openDeleteModal}
                  >
                    <MdDeleteOutline size={18} className="mr-2" /> Delete
                    Profile
                  </button>
                </div>
              )}
            </div>
          )}
          {user && profileUser && user._id !== profileUser._id && (
            <button
              onClick={handleFollowToggle}
              className="absolute top-4 right-3 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded"
            >
              {isFollowing ? "Unfollow" : "Follow"}{" "}
              <RiUserFollowLine size={18} />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-700">
              <img
                src={profileUser.profilePhoto || "/defaultpicture.jpg"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">
                {profileUser?.username || "Unknown User"}
              </h1>
              <p className="text-gray-400 italic text-sm mt-1">
                {profileUser?.profession || "No Profession"}
              </p>
            </div>
          </div>
          <div className="mt-3 text-gray-400 text-sm space-y-1">
            <p>
              <span className="font-semibold text-white">About:</span>{" "}
              {profileUser?.about}
            </p>
            <p>
              <span className="font-semibold text-white">Study:</span>{" "}
              {profileUser?.study}
            </p>
            <p>
              <span className="font-semibold text-white">Contact:</span>{" "}
              {profileUser?.contact}
            </p>
            <p>
              <span className="font-semibold text-white">Followers:</span>{" "}
              {profileUser?.followersCount}
            </p>
          </div>
        </div>
        <div className="relative bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-lg shadow-xl mt-6">
          {favoriteArt ? (
            <div>
              <p className="text-center font-bold flex items-center gap-1 text-2xl mb-3">
               <LuPaintbrushVertical className="text-yellow-400"></LuPaintbrushVertical> User's favorite art
              </p>
              <canvas
                ref={favoriteCanvasRef}
                className="w-full h-auto object-cover"
                style={{ backgroundColor: "#fff", imageRendering: "pixelated" }}
              />
              <h3 className="text-xl font-thin mt-4 ">
                {favoriteArt.title || "Untitled"}
              </h3>
            </div>
          ) : (
            <div className="w-full h-auto object-cover">
              No favorite art yet
            </div>
          )}
        </div>
      </div>
      <div className="relative bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-4xl transform hover:scale-[1.01] transition-transform duration-300">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isFavoritesView ? "Favorited Pixel Arts" : "Pixel Arts"}
        </h2>
        {targetUserId === user?._id && (
          <button
            className="absolute top-4 right-4"
            onClick={toggleFavoritesView}
          >
            {isFavoritesView ? (
              <FaBookmark className="text-xl" />
            ) : (
              <MdBookmarkBorder className="text-xl" />
            )}
          </button>
        )}
        {(isFavoritesView && favArts.length > 0) ||
        (!isFavoritesView && pixelArts.length > 0) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {(isFavoritesView ? favArts : pixelArts).map((art, index) => (
              <div
                key={art._id + index}
                className="rounded-lg overflow-hidden relative group cursor-pointer"
                onClick={() => openLargeModalHandler(art)}
              >
                <canvas
                  ref={(el) => (canvasRefs.current[index] = el)}
                  width={art.canvasSize || 110}
                  height={art.canvasSize || 110}
                  className="block hover:scale(1.01) w-full h-32"
                  style={{
                    backgroundColor: "#fff",
                    imageRendering: "pixelated",
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center">
            {isFavoritesView
              ? "No Favorited Pixel Art Found"
              : "No Pixel Art Found"}
          </p>
        )}
      </div>
      <EditModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={saveProfileChanges}
        formState={editForm}
        onChange={handleEditChange}
        usernameLastChangedAt={profileUser.usernameLastChangedAt}
      />
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded shadow-md w-96 flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-red-500">
              Delete Your Account
            </h2>
            <p>
              This action will remove all of your data and cannot be undone.
            </p>
            <p>Are you sure you want to proceed?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 duration-150 rounded"
              >
                Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}
      {showPixelDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-2xl shadow-md w-96 flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-red-500">
              Delete Pixel Art
            </h2>
            <p>This action will remove the pixel art you chose</p>
            <p>Are you sure you want to proceed?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowPixelDeleteModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmPixelDelete(selectedPixelArtId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 duration-150 rounded"
              >
                Delete Art
              </button>
            </div>
          </div>
        </div>
      )}
      {showLargeModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setShowLargeModal(false)}
        >
          <div className="relative w-fit" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowLargeModal(false)}
              className="absolute top-4 right-4 text-white text-4xl"
            >
              &times;
            </button>
            <canvas
              ref={largeCanvasRef}
              className="block mx-auto"
              style={{ backgroundColor: "#fff", imageRendering: "pixelated" }}
            />
            <div className="mt-4 flex items-center gap-2">
              <img
                src={profileUser.profilePhoto || "/defaultpicture.jpg"}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold">
                  {profileUser?.username || "Unknown User"}
                </h3>
                <p className="text-sm">
                  {profileUser?.profession || "No Profession"}
                </p>
              </div>
            </div>
            {!isFavoritesView && user?._id === profileUser?._id && (
              <div className="absolute bottom-4 right-4 flex items-center gap-3">
                <MdOutlineCoffeeMaker
                  onClick={handleCoffeeMakerClick}
                  className="hover:text-blue-500 duration-150 cursor-pointer"
                  size={20}
                />
                <MdDeleteOutline
                  onClick={() => {
                    setShowPixelDeleteModal(true);
                    setSelectedPixelArtId(selectedLargePixelArt._id);
                  }}
                  className="hover:text-red-500 duration-150 cursor-pointer"
                  size={20}
                />
              </div>
            )}
            {isFavoritesView && (
              <div className="absolute bottom-4 right-4 flex items-center gap-3">
                <IoBookmark
                  onClick={() => {
                    handleRemoveFavorite(selectedLargePixelArt._id);
                    setShowLargeModal(false);
                  }}
                  className="hover:text-red-500 duration-150 cursor-pointer"
                  size={20}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
