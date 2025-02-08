"use client";
import React from "react";
import { useRouter } from "next/navigation";

const Events = () => {
  const router = useRouter();
  return (
    <div className="bg-gradient-to-bl from-red-500 via-black to-gray-900 min-h-screen p-6">
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
            <h2 className="text-xl font-light mb-1">Monthly Portrait Challenge:</h2>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
              Starry Night by Vincent Van Gogh
            </h3>
            <button
              onClick={() => router.push("/dashboard/create?category=monthly art")}
              className="bg-blue-600 text-white py-2 px-3 rounded-full hover:bg-blue-700 transition duration-300"
            >
              Start Drawing
            </button>
          </div>
        </section>
        <section className="mt-8">
          <h4 className="text-xl font-bold text-white mb-3">Rules</h4>
          <ul className="list-disc list-inside space-y-1 text-base text-white">
            <li>The artwork can only be drawn once and submitted.</li>
            <li>
              If your drawing contains inappropriate content, your drawing privileges will be suspended temporarily.
            </li>
            <li>Please respect all participants and their creative efforts.</li>
            <li>Your submission must be entirely original work.</li>
            <li>Follow all guidelines; failure to do so may result in disqualification.</li>
          </ul>
        </section>
        <section className="mt-8">
          <h4 className="text-xl font-bold text-white mb-4">Other Challenges</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <img
                className="w-full object-cover h-48"
                src="/technology.jpg"
                alt="Technology Challenge"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Technology</h3>
                <button
                  onClick={() => router.push("/dashboard/create?category=technology")}
                  className="bg-blue-600 text-white py-2 px-3 rounded-full hover:bg-blue-700 transition duration-300"
                >
                  Start Drawing
                </button>
              </div>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <img
                className="w-full object-cover h-48"
                src="/romantic.jpg"
                alt="Romantic Challenge"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Romantic</h3>
                <button
                  onClick={() => router.push("/dashboard/create?category=romantic")}
                  className="bg-blue-600 text-white py-2 px-3 rounded-full hover:bg-blue-700 transition duration-300"
                >
                  Start Drawing
                </button>
              </div>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <img
                className="w-full object-cover h-48"
                src="/abstract.jpg"
                alt="Abstract Challenge"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Abstract</h3>
                <button
                  onClick={() => router.push("/dashboard/create?category=abstract")}
                  className="bg-blue-600 text-white py-2 px-3 rounded-full hover:bg-blue-700 transition duration-300"
                >
                  Start Drawing
                </button>
              </div>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <img
                className="w-full object-cover h-48"
                src="/nature.jpg"
                alt="Nature Challenge"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Nature</h3>
                <button
                  onClick={() => router.push("/dashboard/create?category=nature")}
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
