"use client";
import React from "react";
import { useRouter } from "next/navigation";
const Events = () => {
  const router = useRouter();
  return (
    <div className="bg-gradient-to-r from-red-700 via-purple-900 to-pink-900 min-h-screen p-6">
      <header className="flex justify-center items-center mb-6">
        <h1 className="text-4xl font-bold text-white">Art Challenges</h1>
      </header>
      <main className="max-w-4xl mx-auto">
        <section className="bg-white shadow-md rounded-lg overflow-hidden">
          <img
            className="w-full object-cover h-80"
            src="/starry-night.jpg"
            alt="Starry Night by Vincent Van Gogh"
          />
          <div className="p-4">
            <h2 className="text-xl font-light mb-1">
              Monthly Portrait Challenge:
            </h2>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
              Starry Night by Vincent Van Gogh
            </h3>
            <p className="text-gray-700 mb-4">
              Create your own interpretation of this iconic masterpiece using
              your unique style.
            </p>
            <button
              onClick={() =>
                router.push("/dashboard/create?category=monthly art")
              }
              className="bg-blue-600 text-white py-2 px-3 rounded-full hover:bg-blue-700 transition duration-300"
            >
              Start Drawing
            </button>
          </div>
        </section>
        <section className="mt-8">
          <h4 className="text-xl font-bold text-white mb-4">
            Other Challenges
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <img
                className="w-full object-cover h-48"
                src="/technologyart.jpg"
                alt="Technology Challenge"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Technology
                </h3>
                <p className="text-gray-700 mb-2">
                  Explore futuristic designs and digital aesthetics in your
                  artwork.
                </p>

                <button
                  onClick={() =>
                    router.push("/dashboard/create?category=technology")
                  }
                  className="bg-blue-600 text-white py-2 px-3 rounded-full hover:bg-blue-700 transition duration-300"
                >
                  Start Drawing
                </button>
              </div>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <img
                className="w-full object-cover h-48"
                src="/romantic.jpeg"
                alt="Romantic Challenge"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Romantic
                </h3>
                <p className="text-gray-700 mb-2">
                  Capture the essence of love and passion with a heartfelt
                  creation.
                </p>

                <button
                  onClick={() =>
                    router.push("/dashboard/create?category=romantic")
                  }
                  className="bg-blue-600 text-white py-2 px-3 rounded-full hover:bg-blue-700 transition duration-300"
                >
                  Start Drawing
                </button>
              </div>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <img
                className="w-full object-cover h-48"
                src="/abstractart.webp"
                alt="Abstract Challenge"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Abstract
                </h3>
                <p className="text-gray-700 mb-2">
                  Let your imagination run wild and express complex emotions
                  through abstract art.
                </p>

                <button
                  onClick={() =>
                    router.push("/dashboard/create?category=abstract")
                  }
                  className="bg-blue-600 text-white py-2 px-3 rounded-full hover:bg-blue-700 transition duration-300"
                >
                  Start Drawing
                </button>
              </div>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <img
                className="w-full object-cover h-48"
                src="/natureart.jpg"
                alt="Nature Challenge"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Nature
                </h3>
                <p className="text-gray-700 mb-2">
                  Recreate the beauty of the natural world with vibrant colors
                  and dynamic scenes.
                </p>

                <button
                  onClick={() =>
                    router.push("/dashboard/create?category=nature")
                  }
                  className="bg-blue-600 text-white py-2 px-3 rounded-full hover:bg-blue-700 transition duration-300"
                >
                  Start Drawing
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
export default Events;
