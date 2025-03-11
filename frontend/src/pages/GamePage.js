import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const GamePage = () => {
  const { id } = useParams(); // Get the game ID from the URL params
  const [game, setGame] = useState(null);

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const response = await fetch(`/api/games/${id}`);
        const data = await response.json();
        setGame(data);
      } catch (error) {
        console.error('Error fetching game details:', error);
      }
    };

    fetchGameDetails();
  }, [id]);

  if (!game) return <div>Loading...</div>;

  return (
    <div>
      <h1>{game.name}</h1>
      {game.cover && game.cover.url && (
        <img
          src={`https:${game.cover.url}`}
          alt={game.name}
          style={{ width: '400px', height: 'auto' }}
        />
      )}
      <p>{game.summary}</p>
      {/* Add more game details as needed */}
    </div>
  );
};

export default GamePage;
