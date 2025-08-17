import React from "react";
import { Link } from "react-router-dom";

const Profile = ({ user }) => {
  if (!user) {
    return (
      <div className="page relative">
        {/* Blur overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Link
            to="/login"
            className="text-white text-xl underline hover:text-blue-300 transition"
          >
            Login to view profile page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page flex flex-col items-center p-6">
      <div className="w-24 h-24 rounded-full bg-gray-300 mb-4" />
      <h1 className="text-2xl font-bold">{user.name}</h1>
      <p className="text-gray-600 mt-2">Welcome to your profile page!</p>
    </div>
  );
};

export default Profile;
