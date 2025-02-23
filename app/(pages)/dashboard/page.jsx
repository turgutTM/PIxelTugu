"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser } from "@/app/features/UserSlice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found. Please log in.");
        }
        const response = await fetch("/api/current-user", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch current user.");
        }
        const data = await response.json();
        setUserData(data);
        dispatch(setUser(data));
        router.push("/dashboard/feed");
      } catch (err) {
        console.error(err);
        // İsteğe bağlı: Hata durumunda login sayfasına yönlendirebilirsiniz.
      }
    };

    fetchCurrentUser();
  }, [dispatch, router]);

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-10 w-10 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="mt-4 text-white">Checking and configuring</p>
        </div>
      </div>
    );
  }

  return null;
};

export default Dashboard;
