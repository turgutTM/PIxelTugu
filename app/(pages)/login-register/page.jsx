"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const router = useRouter();
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Something went wrong");
        return;
      }

      alert(data.message);
      if (endpoint === "/api/login" && data.token) {
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
      }
      setFormData({
        username: "",
        email: "",
        password: "",
      });
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <motion.div
      className="flex items-center justify-center h-screen"
      initial={{
        background: isLogin ? "rgb(255, 87, 87)" : "rgb(87, 136, 255)",
      }}
      animate={{
        background: isLogin
          ? "linear-gradient(to bottom right, rgb(255, 87, 87), rgb(255, 87, 87))"
          : "linear-gradient(to bottom right, rgb(87, 136, 255), rgb(255, 255, 255))",
      }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <div className="relative w-[350px] md:w-[600px] overflow-hidden rounded-2xl shadow-2xl bg-white p-2">
        <motion.div
          className="flex w-[700px] md:w-[1200px]"
          animate={{ x: isLogin ? 0 : -590 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          style={{ display: "flex" }}
        >
          <div className="w-[350px] md:w-[600px] h-[500px] flex flex-col items-center justify-center px-6 py-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-700">
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
                className="mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 rounded-lg transition"
              >
                Login
              </button>
            </form>
            <p className="text-sm text-gray-600 mt-4">
              You have not any account yet?
              <span
                onClick={() => setIsLogin(false)}
                className="ml-2 text-purple-600 cursor-pointer hover:underline"
              >
                Register here.
              </span>
            </p>
          </div>

          <div className="w-[350px] md:w-[600px] h-[500px] flex flex-col items-center justify-center px-6 py-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-700">
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
                className="mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                type="submit"
                className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-lg transition"
              >
                Register
              </button>
            </form>
            <p className="text-sm text-gray-600 mt-4">
              Already have an account?
              <span
                onClick={() => setIsLogin(true)}
                className="ml-2 text-pink-600 cursor-pointer hover:underline"
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
