// src/GameList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const GameList = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the games data from the Go backend
    axios.get('http://localhost:8080/games')
      .then(response => {
        setGames(response.data);  // Save the data in state
        setLoading(false);         // Stop loading
      })
      .catch(error => {
        setError(error);
        setLoading(false);         // Stop loading in case of error
      });
  }, []); // Empty dependency array means it runs only once when the component mounts

  if (loading) return <p>Loading...</p>; // Show loading state
  if (error) return <p>Error loading data: {error.message}</p>; // Show error message

  return (
    <div>
      <h1>Top 10 Games</h1>
      <div className="game-list">
        {games.map((game) => (
          <div key={game.name} className="game">
            <h2>{game.name}</h2>
            <p>{game.genre}</p>
            <p>{game.summary}</p>
            <img
              src={game.cover.url.startsWith('//') ? `https:${game.cover.url}` : game.cover.url}
              alt={`${game.name} Cover`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameList;