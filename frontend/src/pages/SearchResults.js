import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SearchResults = () => {
  const [games, setGames] = useState([]);
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('query'); // Get the search query from the URL

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (query) {
        try {
          const response = await fetch(`/api/games/search?query=${query}`);
          const data = await response.json();
          setGames(data);
        } catch (error) {
          console.error('Error fetching search results:', error);
        }
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div>
      <h1>Search Results for "{query}"</h1>
      <div>
        {games.length === 0 ? (
          <p>No games found for "{query}".</p>
        ) : (
          games.map((game) => (
            <div key={game.id}>
              <h2>{game.name}</h2>
              {game.cover && game.cover.url && (
                <img
                  src={`https:${game.cover.url}`}
                  alt={game.name}
                  style={{ width: '200px', height: 'auto' }}
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

export default SearchResults;
