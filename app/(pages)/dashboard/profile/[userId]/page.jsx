"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { MdDeleteOutline } from "react-icons/md";
import { FiEdit2 } from "react-icons/fi";
import { BsThreeDotsVertical } from "react-icons/bs";
import EditModal from "@/app/components/EditModal";

export default function Profile() {
  const { userId } = useParams();
  const router = useRouter();
  const user = useSelector((state) => state.user.user);
  const [pixelArts, setPixelArts] = useState([]);
  const [profileUser, setProfileUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPixelDeleteModal, setShowPixelDeleteModal] = useState(false);
  const [selectedPixelArtId, setSelectedPixelArtId] = useState(null);
  const [editForm, setEditForm] = useState({
    username: "",
    about: "",
    study: "",
    profession: "",
    contact: ""
  });
  const canvasRefs = useRef([]);
  const targetUserId = userId || user?._id;

  useEffect(() => {
    if (!targetUserId) return;
    (async () => {
      try {
        const res = await fetch(`/api/user?userId=${targetUserId}`);
        if (!res.ok) throw new Error("Failed to fetch user data");
        const userData = await res.json();
        setProfileUser(userData);
      } catch (err) {}
    })();
  }, [targetUserId]);

  useEffect(() => {
    if (!targetUserId) return;
    (async () => {
      try {
        const res = await fetch(`/api/pixel?userId=${targetUserId}`);
        if (!res.ok) throw new Error("Failed to fetch pixel arts");
        const data = await res.json();
        setPixelArts(data);
      } catch (err) {}
    })();
  }, [targetUserId]);

  useEffect(() => {
    pixelArts.forEach((pixelArt, index) => {
      if (!pixelArt || !canvasRefs.current[index]) return;
      const canvas = canvasRefs.current[index];
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

  const openEditModal = () => {
    setEditForm({
      email: profileUser?.email || "",
      username: profileUser?.username || "",
      password: "",
      profilePhoto: profileUser?.profilePhoto || "",
      about: profileUser?.about || "",
      study: profileUser?.study || "",
      profession: profileUser?.profession || "",
      contact: profileUser?.contact || ""
    });
    setShowEditModal(true);
    setShowMenu(false);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveProfileChanges = async () => {
    try {
      const res = await fetch(`/api/user?userId=${profileUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      if (!res.ok) throw new Error("Failed to update user");
      const updatedUser = await res.json();
      setProfileUser(updatedUser);
      setShowEditModal(false);
    } catch (err) {}
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
    setShowMenu(false);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`/api/user?userId=${profileUser._id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete user");
      router.push("/");
    } catch (err) {}
  };

  const confirmPixelDelete = async (id) => {
    try {
      const res = await fetch(`/api/pixel?id=${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete pixel");
      setPixelArts(pixelArts.filter((p) => p._id !== id));
      setShowPixelDeleteModal(false);
    } catch (err) {}
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
    <div className="min-h-screen bg-gradient-to-r from-black to-red-500 text-white p-6 flex flex-col items-center gap-4">
      <div className="relative w-full max-w-lg bg-gray-900 p-6 rounded-lg shadow-xl flex flex-col gap-2 transform hover:scale-[1.01] transition-transform duration-300">
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
                  <MdDeleteOutline size={18} className="mr-2" /> Delete Profile
                </button>
              </div>
            )}
          </div>
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
            <span className="font-semibold text-white">About:</span> {profileUser?.about}
          </p>
          <p>
            <span className="font-semibold text-white">Study:</span> {profileUser?.study}
          </p>
          <p>
            <span className="font-semibold text-white">Contact:</span> {profileUser?.contact}
          </p>
        </div>
      </div>
      <div className="bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-4xl transform hover:scale-[1.01] transition-transform duration-300">
        <h2 className="text-xl font-semibold mb-4">Pixel Arts</h2>
        {pixelArts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {pixelArts.map((pixelArt, index) => (
              <div
                key={pixelArt._id}
                className="p-4 rounded-lg flex flex-col items-center hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="flex relative">
                  <canvas
                    ref={(el) => (canvasRefs.current[index] = el)}
                    className="border rounded-lg border-gray-700"
                    style={{
                      width: "200px",
                      height: "200px",
                      backgroundColor: "white",
                      imageRendering: "pixelated"
                    }}
                  />
                  <MdDeleteOutline
                    onClick={() => {
                      setSelectedPixelArtId(pixelArt._id);
                      setShowPixelDeleteModal(true);
                    }}
                    className="ml-52 cursor-pointer hover:text-red-500 duration-200 absolute"
                  />
                </div>
                <h3 className="text-md flex font-medium mt-2">
                  {pixelArt.title}
                </h3>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No Pixel Art Found</p>
        )}
      </div>
      <EditModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={saveProfileChanges}
        formState={editForm}
        onChange={handleEditChange}
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
    </div>
  );
}
