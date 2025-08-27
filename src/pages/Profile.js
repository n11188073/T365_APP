import React from "react";

const Profile = () => {
  const user = {
    name: "Name",
    username: "Username",
    bio: "Bio",
    profilePic: "https://via.placeholder.com/150", // replace with real image
    posts: [
      "https://via.placeholder.com/300x300?text=Post+1",
      "https://via.placeholder.com/300x300?text=Post+2",
      "https://via.placeholder.com/300x300?text=Post+3",
      "https://via.placeholder.com/300x300?text=Post+4",
      "https://via.placeholder.com/300x300?text=Post+5",
      "https://via.placeholder.com/300x300?text=Post+6",
    ],
  };

  return (
    <div className="max-w-3xl mx-auto p-4 font-sans">
      {/* Header section */}
      <div className="flex items-center space-x-6">
        <img
          src={user.profilePic}
          alt="Profile"
          className="w-24 h-24 rounded-full border-2 border-gray-300"
        />
        <div>
          <h2 className="text-xl font-bold">{user.username}</h2>
          <p className="whitespace-pre-line text-gray-600">{user.bio}</p>
        </div>
      </div>

      {/* Divider */}
      <hr className="my-6 border-gray-300" />

      {/* Posts grid */}
      <h3 className="text-lg font-semibold mb-4">Posts</h3>
      <div className="grid grid-cols-3 gap-2">
        {user.posts.map((post, index) => (
          <div key={index}>
            <img
              src={post}
              alt={`Post ${index + 1}`}
              className="w-full h-full object-cover rounded-md"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
