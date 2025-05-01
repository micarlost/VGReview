import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Cookies from 'js-cookie';

export default function Following() {
  const [followingList, setFollowingList] = useState([]);
  const [error, setError] = useState(null);
  const { userId } = useParams(); // Get the userId from the URL
  const currentUserId = Cookies.get('userId'); // Get current logged-in userId from cookies

  useEffect(() => {
    // Fetch the list of users the current user is following
    fetch(`http://localhost:4000/user/${userId}/following`)  // Correct backend route
      .then(res => res.json())
      .then(data => setFollowingList(data.following)) // Assuming API returns { following: [...] }
      .catch(err => setError(err.message));
  }, [userId, currentUserId]);

  if (error) return <p className="text-white">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-start p-8 space-y-6">
      <h1 className="text-4xl font-bold text-white mb-6">People You're Following</h1>

      {/* If the following list is empty, show a "No following" message */}
      {followingList.length === 0 ? (
        <p className="text-white">No following</p>
      ) : (
        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {followingList.map(following => (
              <Link to={`/profile/${following.id}`} key={following.id}>
                <div className="bg-gray-700 p-4 rounded-lg shadow hover:shadow-lg transition flex flex-col items-center">
                  <img
                    src={`http://localhost:4000/${following.profile_pic}`}
                    alt={following.username}
                    className="w-24 h-24 rounded-full object-cover shadow-md mb-2"
                  />
                  <h3 className="text-center font-semibold text-white">{following.username}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
