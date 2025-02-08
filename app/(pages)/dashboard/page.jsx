"use client";
import React from "react";
import { useEffect, useState } from "react";
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
      } catch (err) {
        console.error(err);
      } finally {
      }
    };

    fetchCurrentUser();
  }, [dispatch, router]);
  return (
    <div>
      <div></div>
    </div>
  );
};

export default Dashboard;
