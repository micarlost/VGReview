import React, { useEffect, useState } from 'react';
import './Home.css';
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
  }, [fetchUrl]);

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2>{title}</h2>
      <div style={{ display: 'flex', overflowX: 'auto', gap: '1rem' }}>
        {games.map((game) => (
          <div key={game.id} style={{ minWidth: '200px' }}>
            {game.cover?.url && (
              <img
                src={`https:${game.cover.url}`}
                alt={game.name}
                style={{ width: '100%', borderRadius: '8px' }}
              />
            )}
            <p>{game.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const HomePage = () => {
  return (
    <div>
      <GameRow title="New Games" fetchUrl="/api/games/new" />
      <GameRow title="Fighting Games" fetchUrl="/api/games/fighting" />
      <GameRow title="Popular Games" fetchUrl="/api/games/popular" />
    </div>
  );
};

export default HomePage;
