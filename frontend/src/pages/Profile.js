import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Cookies from 'js-cookie';

export default function Profile() {
  const [userInfo, setUserInfo] = useState(null);
  const [favoriteGames, setFavoriteGames] = useState([]);
  const [playedGames, setPlayedGames] = useState([]);
  const [ratedGames, setRatedGames] = useState([]);
  const [activeTab, setActiveTab] = useState("favorite"); // Default tab is "favorite"
  const [error, setError] = useState(null);
  const { userId } = useParams(); // Retrieve userId from URL
  const currentUserId = Cookies.get('userId'); // Get the current logged-in user ID

  useEffect(() => {
    // Fetch user info for the specific userId
    fetch(`http://localhost:4000/user/${userId}`)
      .then((response) => response.json())
      .then((data) => setUserInfo(data.user))
      .catch((error) => setError(error.message));

    // Fetch favorite games
    fetch(`http://localhost:4000/user/${userId}/favorite`)
      .then((response) => response.json())
      .then((data) => {
        const gameIDs = data.favorite_game_ids || [];
        Promise.all(
          gameIDs.map(id =>
            fetch(`http://localhost:4000/api/games/${id}`).then(res => res.json())
          )
        ).then(games => setFavoriteGames(games))
         .catch(err => console.error("Error fetching favorite games:", err));
      })
      .catch((error) => setError(error.message));

    // Fetch played games
    fetch(`http://localhost:4000/user/${userId}/played`)
      .then((response) => response.json())
      .then((data) => {
        const playedIDs = data.played_game_ids || [];
        Promise.all(
          playedIDs.map(id =>
            fetch(`http://localhost:4000/api/games/${id}`).then(res => res.json())
          )
        ).then(games => setPlayedGames(games))
         .catch(err => console.error("Error fetching played games:", err));
      })
      .catch((error) => setError(error.message));

    // Fetch rated games
    fetch(`http://localhost:4000/user/${userId}/ratings`)
      .then((response) => response.json())
      .then((data) => {
        const ratings = data.ratings || [];
        Promise.all(
          ratings.map(ratingEntry =>
            fetch(`http://localhost:4000/api/games/${ratingEntry.game_id}`)
              .then(res => res.json())
              .then(game => ({ ...game, userRating: ratingEntry.rating })) // attach rating
          )
        ).then(games => setRatedGames(games))
         .catch(err => console.error("Error fetching rated games:", err));
      })
      .catch((error) => setError(error.message));

  }, [userId]);

  if (error) return <p className="text-white">Error: {error}</p>;
  if (!userInfo) return <p className="text-white">Loading...</p>;

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('userId');
    window.location.reload();
  };

  const renderGames = () => {
    switch (activeTab) {
      case "favorite":
        return favoriteGames.map(game => (
          <Link to={`/games/${game.id}`} key={game.id}>
            <div className="bg-gray-700 p-4 rounded-lg shadow hover:shadow-lg transition">
              <img
                src={game.cover?.url.replace('t_thumb', 't_cover_big') || '/default-game-cover.jpg'}
                alt={game.name}
                className="w-full h-40 object-cover rounded-md mb-2"
              />
              <h3 className="text-center font-semibold text-white">{game.name}</h3>
            </div>
          </Link>
        ));
      case "played":
        return playedGames.map(game => (
          <Link to={`/games/${game.id}`} key={game.id}>
            <div className="bg-gray-700 p-4 rounded-lg shadow hover:shadow-lg transition">
              <img
                src={game.cover?.url.replace('t_thumb', 't_cover_big') || '/default-game-cover.jpg'}
                alt={game.name}
                className="w-full h-40 object-cover rounded-md mb-2"
              />
              <h3 className="text-center font-semibold text-white">{game.name}</h3>
            </div>
          </Link>
        ));
      case "rated":
        return ratedGames.map(game => (
          <Link to={`/games/${game.id}`} key={game.id}>
            <div className="bg-gray-700 p-4 rounded-lg shadow hover:shadow-lg transition flex flex-col items-center">
              <img
                src={game.cover?.url.replace('t_thumb', 't_cover_big') || '/default-game-cover.jpg'}
                alt={game.name}
                className="w-full h-40 object-cover rounded-md mb-2"
              />
              <h3 className="text-center font-semibold text-white">{game.name}</h3>
              <p className="text-yellow-500 font-bold mt-2">{`Your Rating: ${game.userRating} / 5`}</p>
            </div>
          </Link>
        ));
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-start p-8 space-y-6">
      <div className="flex flex-row w-full max-w-4xl mb-10">
        {/* Profile Info on the Left */}
        <div className="w-2/3 flex flex-col items-start space-y-4">
          <img
            src={`http://localhost:4000/${userInfo.profile_pic}`}
            alt="Profile"
            className="w-40 h-40 rounded-full object-cover shadow-md"
          />
          <h1 className="text-4xl font-bold text-white">{userInfo.username}</h1>
          <p className="text-gray-400 text-left max-w-lg">{userInfo.bio}</p>

          {/* Account Settings and Logout Button */}
          {currentUserId === userId && (
            <div className="flex space-x-4 mt-4">
              <Link to="/updateaccount">
                <button className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                  Account Settings
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Sidebar Below Profile */}
      <div className="flex justify-start w-full max-w-4xl mb-10 space-x-6">
        <button 
          className={`px-4 py-2 ${activeTab === "favorite" ? 'bg-red-500 text-white' : 'bg-gray-700 text-white'}`} 
          onClick={() => setActiveTab("favorite")}
        >
          Favorite Games
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === "played" ? 'bg-red-500 text-white' : 'bg-gray-700 text-white'}`} 
          onClick={() => setActiveTab("played")}
        >
          Played Games
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === "rated" ? 'bg-red-500 text-white' : 'bg-gray-700 text-white'}`} 
          onClick={() => setActiveTab("rated")}
        >
          Rated Games
        </button>
      </div>

      {/* Game Sections */}
      <div className="w-full max-w-4xl mt-10">
        <h2 className="text-2xl font-bold text-white mb-4">{`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Games`}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {renderGames()}
        </div>
      </div>
    </div>
  );
}
