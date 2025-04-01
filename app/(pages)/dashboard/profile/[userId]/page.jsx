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
import { CgClose } from "react-icons/cg";

export default function Profile() {
  const { userId } = useParams();
  const router = useRouter();
  const user = useSelector((state) => state.user.user);
  const [pixelArts, setPixelArts] = useState([]);
  const [favArts, setFavArts] = useState([]);
  const [profileUser, setProfileUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProfilePicture, setShowProfilePicture] = useState(false);
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
  const [isLoading, setIsLoading] = useState(true);
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
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
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
  }, [user, targetUserId]);

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
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    }
  };

  const openShowPicture = () => {
    setShowProfilePicture(true); 
  };

  const closeShowPicture = () => {
    setShowProfilePicture(false); 
  }

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
      await res.json();
      toast.success("Set as favorite art! Refresh to see changes.");
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast.error("Failed to set as favorite");
    }
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`/api/user?userId=${profileUser._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete user");
      localStorage.removeItem("token");
      toast.success("Account deleted successfully");
      router.push("/");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete account");
    }
  };

  const confirmPixelDelete = async (id) => {
    try {
      const res = await fetch(`/api/pixel?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete pixel");
      setPixelArts(pixelArts.filter((p) => p._id !== id));
      setShowPixelDeleteModal(false);
      toast.success("Pixel art deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete pixel art");
    }
  };

  const openLargeModalHandler = (pixelArt) => {
    setSelectedLargePixelArt(pixelArt);
    setShowLargeModal(true);
  };

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/favorites?userId=${targetUserId}`);
      if (!res.ok) throw new Error("Failed to fetch favorites");
      const data = await res.json();
      const favs = data.favorites.map((fav) => fav.pixelArtId);
      const uniqueFavs = favs.filter(
        (fav, index, self) =>
          index === self.findIndex((t) => t && t._id === fav._id)
      );
      setFavArts(uniqueFavs);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      toast.error("Failed to load favorites");
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
        toast.success(`Unfollowed ${profileUser.username}`);
      } else {
        await followUser(user._id, profileUser._id);
        setIsFollowing(true);
        toast.success(`Now following ${profileUser.username}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update follow status");
    }
  };

  const handleRemoveFavorite = async (pixelArtId) => {
    try {
      await removeFavorite(user._id, pixelArtId);
      setFavArts((prevFavs) =>
        prevFavs.filter((fav) => fav._id !== pixelArtId)
      );
      toast.success("Removed from favorites");
    } catch (error) {
      console.error("Failed to remove favorite", error);
      toast.error("Failed to remove from favorites");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-black via-gray-900 to-red-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-gray-800 animate-pulse"></div>
          <div className="w-48 h-6 bg-gray-800 animate-pulse rounded-lg"></div>
          <div className="w-60 h-4 bg-gray-800 animate-pulse rounded-lg"></div>
          <div className="w-40 h-4 bg-gray-800 animate-pulse rounded-lg"></div>
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-black via-gray-900 to-red-900 text-white">
        <div className="bg-gray-900 p-8 rounded-xl shadow-2xl">
          <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
          <p className="text-gray-400">
            The user profile you're looking for doesn't exist or has been
            removed.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-full transition-all duration-300"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-black via-gray-900 to-red-900 text-white p-6 flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-1/3 flex flex-col gap-6">
        <div className="relative w-full bg-gray-900 p-8 rounded-2xl shadow-2xl flex flex-col gap-4 transform transition-all duration-300 hover:shadow-red-900/50 border border-gray-800">
          {user?._id === profileUser?._id && (
            <div className="absolute top-4 right-4 cursor-pointer">
              <BsThreeDotsVertical
                size={20}
                onClick={() => setShowMenu(!showMenu)}
                className="hover:text-red-400 transition duration-200"
              />
              {showMenu && (
                <div className="absolute right-0 mt-2 bg-gray-800 text-white rounded-xl shadow-2xl w-40 z-10 overflow-hidden border border-gray-700">
                  <button
                    className="flex items-center px-4 py-3 w-full hover:bg-gray-700 transition-colors duration-200"
                    onClick={openEditModal}
                  >
                    <FiEdit2 className="mr-2" /> Edit Profile
                  </button>
                  <button
                    className="flex items-center px-4 py-3 w-full text-red-400 hover:bg-gray-700 transition-colors duration-200"
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
              className="absolute top-4 right-4 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 px-4 py-2 rounded-full transition-all duration-300 shadow-lg"
            >
              {isFollowing ? "Unfollow" : "Follow"}{" "}
              <RiUserFollowLine size={18} />
            </button>
          )}
          <div className="flex flex-col relative sm:flex-row items-center gap-5">
            <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-gray-700 shadow-lg">
              <img
                onClick={openShowPicture}
                src={profileUser.profilePhoto || "/defaultpicture.jpg"}
                alt="Profile"
                className="w-full h-full cursor-pointer object-cover"
              />
            </div>
            {showProfilePicture && (
              <div>
                <img
                  src={profileUser.profilePhoto || "/defaultpicture.jpg"}
                  alt="Profile"
                  className="w-12 h-12 rounded-full absolute justify-center items-center cursor-pointer object-cover border-2 border-gray-700"
                />
              </div>
            )}
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-red-400 bg-clip-text text-transparent">
                {profileUser?.username || "Unknown User"}
              </h1>
              <p className="text-gray-400 italic text-sm mt-1">
                {profileUser?.profession || "No Profession"}
              </p>
            </div>
          </div>
          <div className="mt-5 text-gray-300 space-y-3 border-t border-gray-800 pt-4">
            <p className="flex flex-col">
              <span className="font-semibold text-red-400 text-sm">About</span>{" "}
              <span className="ml-2 mt-1">
                {profileUser?.about || "No information provided"}
              </span>
            </p>
            <p className="flex flex-col">
              <span className="font-semibold text-red-400 text-sm">Study</span>{" "}
              <span className="ml-2 mt-1">
                {profileUser?.study || "No information provided"}
              </span>
            </p>
            <p className="flex flex-col">
              <span className="font-semibold text-red-400 text-sm">
                Contact
              </span>{" "}
              <span className="ml-2 mt-1">
                {profileUser?.contact || "No information provided"}
              </span>
            </p>
            <p className="flex flex-col">
              <span className="font-semibold text-red-400 text-sm">
                Followers
              </span>{" "}
              <span className="ml-2 mt-1">
                {profileUser?.followersCount || 0}
              </span>
            </p>
          </div>
        </div>

        <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-800">
          {favoriteArt ? (
            <div>
              <h3 className="text-center font-bold flex items-center justify-center gap-2 text-xl mb-5">
                <LuPaintbrushVertical className="text-yellow-400" size={20} />
                <span className="bg-gradient-to-r from-yellow-400 to-red-400 bg-clip-text text-transparent">
                  Favorite Creation
                </span>
              </h3>
              <div className="rounded-lg overflow-hidden shadow-lg border border-gray-700">
                <canvas
                  ref={favoriteCanvasRef}
                  className="w-full h-auto object-cover"
                  style={{
                    backgroundColor: "#fff",
                    imageRendering: "pixelated",
                  }}
                />
              </div>
              <h3 className="text-xl font-medium mt-4 text-center bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                {favoriteArt.title || "Untitled Masterpiece"}
              </h3>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <LuPaintbrushVertical size={30} className="mb-2 opacity-50" />
              <p>No favorite art selected yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="relative bg-gray-900 p-8 rounded-2xl shadow-2xl w-full md:w-2/3 transform transition-all duration-300 hover:shadow-red-900/50 border border-gray-800">
        <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-white to-red-400 bg-clip-text text-transparent">
          {isFavoritesView ? "Favorite Collections" : "Pixel Creations"}
        </h2>

        {targetUserId === user?._id && (
          <button
            className="absolute top-4 right-4 bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition-all duration-300"
            onClick={toggleFavoritesView}
          >
            {isFavoritesView ? (
              <FaBookmark className="text-xl text-yellow-400" />
            ) : (
              <MdBookmarkBorder className="text-xl" />
            )}
          </button>
        )}

        {(isFavoritesView && favArts.length > 0) ||
        (!isFavoritesView && pixelArts.length > 0) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {(isFavoritesView ? favArts : pixelArts).map((art, index) => (
              <div
                key={art._id + index}
                className="rounded-xl overflow-hidden relative group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg border border-gray-800 bg-gray-800"
                onClick={() => openLargeModalHandler(art)}
              >
                <canvas
                  ref={(el) => (canvasRefs.current[index] = el)}
                  width={art.canvasSize || 110}
                  height={art.canvasSize || 110}
                  className="block w-full h-36 object-cover"
                  style={{
                    backgroundColor: "#fff",
                    imageRendering: "pixelated",
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                    <div className="bg-black bg-opacity-70 px-3 py-1 rounded-full text-xs">
                      {art.title || "View Artwork"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 border border-gray-800 rounded-xl bg-gray-800 bg-opacity-50">
            <LuPaintbrushVertical size={40} className="mb-3 opacity-50" />
            <p className="text-lg">
              {isFavoritesView
                ? "No Favorite Artworks Found"
                : "No Artworks Created Yet"}
            </p>
            {!isFavoritesView && user?._id === profileUser?._id && (
              <button
                onClick={() => router.push("/create")}
                className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-full transition-all duration-300"
              >
                Create New Art
              </button>
            )}
          </div>
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
        <div className="fixed inset-0 bg-black  bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-4 border border-gray-800 transform transition-all duration-300 animate-fadeIn">
            <h2 className="text-2xl font-bold text-red-500">
              Delete Your Account
            </h2>
            <p className="text-gray-300">
              This action will permanently remove all of your data and cannot be
              undone.
            </p>
            <p className="text-gray-300 font-medium">
              Are you sure you want to proceed?
            </p>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-full transition-all duration-300"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {showPixelDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-4 border border-gray-800 transform transition-all duration-300 animate-fadeIn">
            <h2 className="text-2xl font-bold text-red-500">Delete Artwork</h2>
            <p className="text-gray-300">
              This action will permanently remove this artwork from your
              collection.
            </p>
            <p className="text-gray-300 font-medium">
              Are you sure you want to proceed?
            </p>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowPixelDeleteModal(false)}
                className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmPixelDelete(selectedPixelArtId)}
                className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-full transition-all duration-300"
              >
                Delete Artwork
              </button>
            </div>
          </div>
        </div>
      )}

      {showLargeModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-40 backdrop-blur-sm"
          onClick={() => setShowLargeModal(false)}
        >
          <div
            className="relative bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700 max-w-4xl transform transition-all duration-300 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLargeModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl bg-gray-800 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
            >
              &times;
            </button>

            <div className="rounded-xl overflow-hidden shadow-2xl mb-6 border border-gray-800">
              <canvas
                ref={largeCanvasRef}
                className="block mx-auto"
                style={{ backgroundColor: "#fff", imageRendering: "pixelated" }}
              />
            </div>

            <div className="flex items-center gap-4 border-t border-gray-800 pt-4">
              <img
                src={profileUser.profilePhoto || "/defaultpicture.jpg"}
                alt="Profile"
                className="w-12 h-12 rounded-full cursor-pointer object-cover border-2 border-gray-700"
              />

              <div>
                <h3 className="text-xl font-bold text-white">
                  {profileUser?.username || "Unknown User"}
                </h3>
                <p className="text-gray-400 text-sm">
                  {profileUser?.profession || "Artist"}
                </p>
              </div>

              {!isFavoritesView && user?._id === profileUser?._id && (
                <div className="ml-auto flex items-center gap-4">
                  <button
                    onClick={handleCoffeeMakerClick}
                    className="bg-blue-600 hover:bg-blue-700 p-2 rounded-full transition-all duration-300 group"
                    title="Set as favorite"
                  >
                    <MdOutlineCoffeeMaker className="text-white" size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setShowPixelDeleteModal(true);
                      setSelectedPixelArtId(selectedLargePixelArt._id);
                    }}
                    className="bg-red-600 hover:bg-red-700 p-2 rounded-full transition-all duration-300"
                    title="Delete artwork"
                  >
                    <MdDeleteOutline className="text-white" size={20} />
                  </button>
                </div>
              )}

              {isFavoritesView && (
                <div className="ml-auto flex items-center gap-4">
                  <button
                    onClick={() => {
                      handleRemoveFavorite(selectedLargePixelArt._id);
                      setShowLargeModal(false);
                    }}
                    className="bg-yellow-600 hover:bg-yellow-700 p-2 rounded-full transition-all duration-300"
                    title="Remove from favorites"
                  >
                    <IoBookmark className="text-white" size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showProfilePicture && profileUser && (
        <div
          className="fixed inset-0 bg-black bg-opacity-85 flex items-center justify-center z-50 backdrop-blur-md p-4" 
          onClick={closeShowPicture} 
        >
          <div
            className="relative max-w-lg max-h-[80vh] w-auto h-auto" 
            onClick={(e) => e.stopPropagation()} 
          >
       
            <button
              onClick={closeShowPicture}
              className="absolute -top-2 -right-2 text-white bg-gray-800 bg-opacity-70 rounded-full p-1.5 hover:bg-opacity-100 transition-all duration-200 z-10"
              aria-label="Close profile picture view"
            >
              <CgClose size={22} />
            </button>
         
            <img
              src={profileUser.profilePhoto || "/defaultpicture.jpg"}
              alt={`${profileUser.username}'s Profile Picture`}
              className="block w-full h-full object-contain rounded-lg shadow-2xl"  
            />
          </div>
        </div>
      )}
    </div>
  );
}
