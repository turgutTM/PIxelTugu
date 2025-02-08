"use client";
import React, { useState } from "react";
import Link from "next/link"; // ✅ Link'i içe aktar
import { PiCoffeeBold } from "react-icons/pi";
import { MdOutlineEmojiEvents } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { LiaUserFriendsSolid } from "react-icons/lia";
import { TbLogout2 } from "react-icons/tb";
import { GoPlusCircle } from "react-icons/go";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../features/UserSlice";

export default function Sidebar() {
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state) => state.user.user);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        localStorage.removeItem("token");
        dispatch(logoutUser());
        router.push("/login-register");
      } else {
        console.error("Failed to log out");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <aside className="bg-[#242424] text-white h-screen w-16 p-4 flex flex-col justify-between items-center">
      <div className="text-2xl font-playwrite">T</div>
      <ul className="space-y-4">
        {[
          { icon: PiCoffeeBold, label: "Dashboard", href: "/dashboard/feed" },
          {
            icon: CgProfile,
            label: "Profile",
            href: `/dashboard/profile/${user._id}`,
          },

          {
            icon: LiaUserFriendsSolid,
            label: "Follows",
            href: "/dashboard/pursued",
          },
          {
            icon: MdOutlineEmojiEvents,
            label: "Events",
            href: "/dashboard/events",
          },
          { icon: GoPlusCircle, label: "Create", href: "/dashboard/create" },
        ].map(({ icon: Icon, label, href }, index) => (
          <li key={index} className="relative group">
            <Link href={href} passHref>
              <div className="flex justify-center items-center p-3 rounded-lg hover:bg-[#333333] cursor-pointer">
                <Icon size={20} />
                <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-black text-white text-sm rounded-md scale-0 group-hover:scale-100 origin-left whitespace-nowrap">
                  {label}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <div
        className="relative group cursor-pointer"
        onClick={() => setShowConfirmLogout(true)}
      >
        <div className="flex justify-center items-center p-3 rounded-lg hover:bg-red-600">
          <TbLogout2 size={20} />
          <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-black text-white text-sm rounded-md scale-0 group-hover:scale-100 origin-left whitespace-nowrap">
            Logout
          </span>
        </div>
      </div>
      {showConfirmLogout && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-4 rounded-3xl flex flex-col items-center space-y-4">
            <p>Are you sure you want to logout?</p>
            <div className="flex space-x-4">
              <button
                className="bg-gray-600 px-4 py-2 rounded-md hover:bg-gray-500"
                onClick={() => setShowConfirmLogout(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 px-4 py-2 rounded-md hover:bg-red-500"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
