import React, { useEffect, useState } from 'react';

const HomePage = () => {
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetch('/api/games')  // Assuming the Go server is running on '/api/games'
      .then((response) => response.json())
      .then((data) => setGames(data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  return (
    <div>
      <h1>Game Reviews</h1>
      <div className="games-list">
        {games.map((game, index) => (
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
        ))}
      </div>
    </div>
  );
};

export default HomePage;