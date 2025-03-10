import React, { useEffect, useState } from 'react';
import './Home.css';

const Home = ({ ApiStatus }) => {
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetch('/api/games')  // Assuming the Go server is running on '/api/games'
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched games:', data);  // Log the data to check if it's correct
        setGames(data);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className="home-container">
      <h1>Game Reviews</h1>
      <div className="games-list">
        {games.length === 0 ? (
          <p>No games available</p>  // Show a message if no games are found
        ) : (
          games.map((game, index) => (
            <div key={index} className="game-item">
              <h2>{game.name}</h2>
              {game.cover && game.cover.url && (
                <img
                  src={`https:${game.cover.url}`} // IGDB returns the image URL without the domain
                  alt={game.name}
                  className="game-cover"
                />
              )}
              <p>{game.summary}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;