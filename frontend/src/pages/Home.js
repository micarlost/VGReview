import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import noPhoto from "../images/no_image.jpg"; // Optional, in case a game has no image.

const GameRow = ({ title, fetchUrl }) => {
  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch(fetchUrl);
        const data = await res.json();
        setGames(data);
      } catch (err) {
        console.error(`Failed to fetch ${title}`, err);
      }
    };

    fetchGames();
  }, [fetchUrl, title]);

  return (
    <div style={{ marginBottom: '4rem' }}>
      <h2 className="text-4xl text-white text-center font-bold mb-6">{title}</h2>
      <div className="game-grid">
        {games.map((game) => (
          <Link key={game.id} to={`/games/${game.id}`} className="game-card-link">
            <div className="game-card">
              <h2>{game.name}</h2>
              <img
                src={game.cover?.url
                  ? game.cover.url.replace("t_thumb", "t_cover_big")
                  : noPhoto}
                alt={game.name}
              />
              <p>
                {game.summary
                  ? game.summary.length > 150
                    ? game.summary.slice(0, 150) + '...'
                    : game.summary
                  : "No description available."}
              </p>
              {/* Display Release Date */}
              {game.first_release_date && (
                <p className="release-date">
                  Release Date: {new Date(game.first_release_date * 1000).toLocaleDateString()}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const HomePage = () => {
  return (
    <div className="bg-black text-white min-h-screen p-6">
      {/* Company description */}
      <div className="home-header text-center mb-10">
        <h1 className="text-5xl font-bold mb-4">Welcome to VG REVIEW!</h1>
        <p className="text-2xl">Discover, review, and stay up to date with the latest games!</p>
      </div>

      {/* Upcoming Games Section */}
      <GameRow title="Upcoming Games" fetchUrl="http://localhost:4000/api/games/upcoming" />

      {/* New Releases Section */}
      <GameRow title="New Releases" fetchUrl="http://localhost:4000/api/games/new" />
    </div>
  );
};

export default HomePage;
