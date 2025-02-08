import React from "react";
import { CiStar } from "react-icons/ci";
import Link from "next/link";
const Navbar = () => {
  return (
    <div className="fixed top-0 left-0 w-full bg-gradient-to-r from-red-500 shadow-lg z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-12 ">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <img className="w-15 h-12" src="/imageTugu.png"></img>
          </div>

          <div className="flex items-center gap-7">
            <div className="flex items-center gap-2 hover:border  hover:border-gray-300 cursor-pointer duration-200 rounded-lg p-2">
              <CiStar className="text-gray-200 text-lg hover:text-white"></CiStar>
              <p className="text-gray-200 text-base hover:text-white">
                Star on Github
              </p>
            </div>
            <Link href="/dashboard">
              <p className="px-5 py-2 bg-red-500 text-gray-200  font-semibold text-lg rounded-lg shadow-md hover:shadow-lg hover:shadow-red-500/50 hover:bg-red-400 hover:text-white  transition-all duration-200 cursor-pointer">
                Dashboard
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
