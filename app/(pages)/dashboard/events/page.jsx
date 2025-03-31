"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Events = () => {
  const router = useRouter();
  const [gradientPosition, setGradientPosition] = useState(0);

  useEffect(() => {
    const animateGradient = () => {
      const interval = setInterval(() => {
        setGradientPosition((prev) => (prev >= 100 ? 0 : prev + 0.5));
      }, 50);
      return () => clearInterval(interval);
    };

    const animation = animateGradient();
    return () => animation;
  }, []);

  const backgroundStyle = {
    backgroundImage: `linear-gradient(${gradientPosition}deg, #7928CA, #FF0080, #8A2BE2, #4B0082)`,
    backgroundSize: '400% 400%',
    animation: 'gradientAnimation 15s ease infinite'
  };

  return (
    <div 
      className="min-h-screen p-6 relative overflow-hidden transition-all duration-500" 
      style={backgroundStyle}
    >
      <div className="absolute inset-0 backdrop-blur-sm bg-black bg-opacity-30"></div>
      
      <div className="relative z-10">
        <header className="flex justify-center items-center mb-8">
          <h1 className="text-5xl font-extrabold text-white tracking-tight drop-shadow-lg">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-yellow-100">
              Art Challenges
            </span>
          </h1>
        </header>
        
        <main className="max-w-5xl mx-auto">
          <section className="bg-white bg-opacity-10 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden border border-white border-opacity-20 transition-all duration-300 hover:shadow-purple-500/20 hover:scale-[1.01]">
            <div className="relative">
              <img
                className="w-full object-cover h-96 transition-transform duration-700 hover:scale-105"
                src="/starry-night.jpg"
                alt="Starry Night by Vincent Van Gogh"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-32"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h2 className="text-xl font-light mb-1 text-amber-200">
                  Monthly Portrait Challenge:
                </h2>
                <h3 className="text-3xl font-bold mb-3 drop-shadow-lg">
                  Starry Night by Vincent Van Gogh
                </h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-100 mb-6 text-lg leading-relaxed">
                Create your own interpretation of this iconic masterpiece using
                your unique style.
              </p>
              <button
                onClick={() =>
                  router.push("/dashboard/create?category=monthly art")
                }
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-full hover:from-blue-600 hover:to-purple-700 transition duration-300 transform hover:scale-105 shadow-lg"
              >
                Start Drawing
              </button>
            </div>
          </section>
          
          <section className="mt-12">
            <h4 className="text-2xl font-bold text-white mb-8 text-center drop-shadow-lg">
              <span className="pb-2 border-b-2 border-purple-400">Other Challenges</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="bg-white bg-opacity-10 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden border border-white border-opacity-20 transition-all duration-300 hover:shadow-purple-500/20 hover:scale-[1.03] group">
                <div className="relative overflow-hidden">
                  <img
                    className="w-full object-cover h-56 transition-transform duration-700 group-hover:scale-110"
                    src="/technologyart.jpg"
                    alt="Technology Challenge"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors">
                    Technology
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Explore futuristic designs and digital aesthetics in your
                    artwork.
                  </p>
                  <button
                    onClick={() =>
                      router.push("/dashboard/create?category=technology")
                    }
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 px-5 rounded-full hover:from-indigo-600 hover:to-purple-700 transition duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Start Drawing
                  </button>
                </div>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden border border-white border-opacity-20 transition-all duration-300 hover:shadow-rose-500/20 hover:scale-[1.03] group">
                <div className="relative overflow-hidden">
                  <img
                    className="w-full object-cover h-56 transition-transform duration-700 group-hover:scale-110"
                    src="/romantic.jpeg"
                    alt="Romantic Challenge"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-rose-300 transition-colors">
                    Romantic
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Capture the essence of love and passion with a heartfelt
                    creation.
                  </p>
                  <button
                    onClick={() =>
                      router.push("/dashboard/create?category=romantic")
                    }
                    className="bg-gradient-to-r from-rose-500 to-pink-600 text-white py-2 px-5 rounded-full hover:from-rose-600 hover:to-pink-700 transition duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Start Drawing
                  </button>
                </div>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden border border-white border-opacity-20 transition-all duration-300 hover:shadow-amber-500/20 hover:scale-[1.03] group">
                <div className="relative overflow-hidden">
                  <img
                    className="w-full object-cover h-56 transition-transform duration-700 group-hover:scale-110"
                    src="/abstractart.webp"
                    alt="Abstract Challenge"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-amber-300 transition-colors">
                    Abstract
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Let your imagination run wild and express complex emotions
                    through abstract art.
                  </p>
                  <button
                    onClick={() =>
                      router.push("/dashboard/create?category=abstract")
                    }
                    className="bg-gradient-to-r from-amber-500 to-orange-600 text-white py-2 px-5 rounded-full hover:from-amber-600 hover:to-orange-700 transition duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Start Drawing
                  </button>
                </div>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden border border-white border-opacity-20 transition-all duration-300 hover:shadow-green-500/20 hover:scale-[1.03] group">
                <div className="relative overflow-hidden">
                  <img
                    className="w-full object-cover h-56 transition-transform duration-700 group-hover:scale-110"
                    src="/natureart.jpg"
                    alt="Nature Challenge"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-green-300 transition-colors">
                    Nature
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Recreate the beauty of the natural world with vibrant colors
                    and dynamic scenes.
                  </p>
                  <button
                    onClick={() =>
                      router.push("/dashboard/create?category=nature")
                    }
                    className="bg-gradient-to-r from-green-500 to-teal-600 text-white py-2 px-5 rounded-full hover:from-green-600 hover:to-teal-700 transition duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Start Drawing
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
      
      <style jsx>{`
        @keyframes gradientAnimation {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
};

export default Events;