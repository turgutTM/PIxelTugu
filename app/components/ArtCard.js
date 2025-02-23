"use client";
import React from "react";
import Link from "next/link";
import CanvasCell from "@/app/components/CanvasCell";
import { FcLikePlaceholder, FcLike } from "react-icons/fc";
import { RiUserUnfollowLine } from "react-icons/ri";
import { IoMdAddCircleOutline } from "react-icons/io";
import { PiWarningBold } from "react-icons/pi";
import { MdBookmarkBorder } from "react-icons/md";
import { FaBookmark } from "react-icons/fa";

const ArtCard = ({
  art,
  onSelect,
  likedArts,
  handleLike,
  likeCounts,
  user,
  followingUsers,
  handleFollow,
  handleUnfollow,
  openReportModal,
  favorites,
  handleFavorite,
}) => {
  return (
    <div className="p-4">
      <div className="relative group bg-gradient-to-bl from-gray-800 via-gray-900 to-black rounded-xl shadow-md flex flex-col p-4 hover:scale-[1.02] transition-transform duration-300 hover:shadow-xl">
        <CanvasCell art={art} onClick={() => onSelect(art)} />
        <div className="mt-3">
          <h3 className="text-lg font-semibold text-white line-clamp-1">
            {art.title || "Untitled"}
          </h3>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-400">
              <img
                className="w-full h-full object-cover"
                src={art.userId?.profilePhoto || "/defaultpicture.jpg"}
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
                  className="text-xl mb-1 cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => handleLike(art._id)}
                />
              ) : (
                <FcLikePlaceholder
                  className="text-xl mb-1 cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => handleLike(art._id)}
                />
              )}
              <span className="text-white">{likeCounts[art._id] || 0}</span>
            </div>
            {user && art.userId && user._id !== art.userId._id && (
              <>
                {followingUsers[art.userId._id] ? (
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
                    <IoMdAddCircleOutline className="text-xl" />
                  </button>
                )}
              </>
            )}
            <button
              className="text-white hover:text-yellow-400 transition-colors"
              onClick={() => openReportModal(art)}
            >
              <PiWarningBold className="text-xl" />
            </button>
          </div>
        </div>
        <button
          className="absolute bottom-3 right-3 text-white hover:text-yellow-400 transition-colors"
          onClick={() => handleFavorite(art)}
        >
          {favorites[art._id] ? (
            <FaBookmark className="text-base" />
          ) : (
            <MdBookmarkBorder className="text-xl" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ArtCard;
