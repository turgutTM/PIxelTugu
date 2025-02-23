"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [squarePositions, setSquarePositions] = useState([]);
  const router = useRouter();

  useEffect(() => {
    setSquarePositions(
      Array.from({ length: 40 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }))
    );
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e, endpoint) => {
    e.preventDefault();
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) return;
      if (
        (endpoint === "/api/login" || endpoint === "/api/register") &&
        data.token
      ) {
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
      }
      setFormData({ username: "", email: "", password: "" });
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <motion.div className="relative flex items-center justify-center h-screen bg-red-600">
      {squarePositions.map((pos, index) => (
        <div
          key={index}
          className="absolute w-4 h-4 bg-gradient-to-br from-pixelPink to-pixelBlue rounded animate-float"
          style={pos}
        />
      ))}
      <div className="relative z-10 w-[350px] md:w-[600px] overflow-hidden rounded-2xl shadow-2xl p-2 bg-white">
        <motion.div
          className="flex w-[700px] md:w-[1200px]"
          animate={{ x: isLogin ? 0 : -590 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          style={{ display: "flex" }}
        >
          <div className="w-[350px] md:w-[600px] h-[500px] flex flex-col items-center justify-center px-6 py-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-pixelBlack">
              Login
            </h2>
            <form
              className="flex flex-col w-full max-w-sm"
              onSubmit={(e) => handleSubmit(e, "/api/login")}
            >
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="mb-4 p-3 border border-pixelBlack rounded-lg focus:outline-none focus:ring-2 focus:ring-pixelPink"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="mb-4 p-3 border border-pixelBlack rounded-lg focus:outline-none focus:ring-2 focus:ring-pixelPink"
              />
              <button
                type="submit"
                className="bg-pixelPink hover:bg-pixelYellow text-pixelWhite font-semibold py-3 rounded-lg transition"
              >
                Login
              </button>
            </form>
            <p className="text-sm text-pixelBlack mt-4">
              You have not any account yet?
              <span
                onClick={() => setIsLogin(false)}
                className="ml-2 text-pixelBlue cursor-pointer hover:underline"
              >
                Register here.
              </span>
            </p>
          </div>
          <div className="w-[350px] md:w-[600px] h-[500px] flex flex-col items-center justify-center px-6 py-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-pixelBlack">
              Register
            </h2>
            <form
              className="flex flex-col w-full max-w-sm"
              onSubmit={(e) => handleSubmit(e, "/api/register")}
            >
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                className="mb-4 p-3 border border-pixelBlack rounded-lg focus:outline-none focus:ring-2 focus:ring-pixelGreen"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="mb-4 p-3 border border-pixelBlack rounded-lg focus:outline-none focus:ring-2 focus:ring-pixelGreen"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="mb-4 p-3 border border-pixelBlack rounded-lg focus:outline-none focus:ring-2 focus:ring-pixelGreen"
              />
              <button
                type="submit"
                className="bg-pixelGreen hover:bg-pixelYellow text-pixelWhite font-semibold py-3 rounded-lg transition"
              >
                Register
              </button>
            </form>
            <p className="text-sm text-pixelBlack mt-4">
              Already have an account?
              <span
                onClick={() => setIsLogin(true)}
                className="ml-2 text-pixelBlue cursor-pointer hover:underline"
              >
                Login here.
              </span>
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LoginRegister;
