import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import Notiflix from 'notiflix';
import { FaStar } from 'react-icons/fa'; // New import for stars
import './GameDetails.css';

export default function GameDetails() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isPlayed, setIsPlayed] = useState(false);
  const [playedLoading, setPlayedLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0); // New hover state

  useEffect(() => {
    fetchGame();
    checkFavoriteStatus();
    checkPlayedStatus();
    fetchRating();
  }, [id]);

  async function fetchGame() {
    try {
      const response = await fetch(`http://localhost:4000/api/games/${id}`);
      const data = await response.json();
      setGame(data);
    } catch (error) {
      console.error('Error fetching game:', error);
    } finally {
      setLoading(false);
    }
  }

  async function checkFavoriteStatus() {
    const userId = Cookies.get('userId');
    if (!userId) return;

    try {
      const response = await fetch(`http://localhost:4000/user/${userId}/favorite`);
      const data = await response.json();
      setIsFavorite(data.favorite_game_ids?.includes(parseInt(id)));
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  }

  async function checkPlayedStatus() {
    const userId = Cookies.get('userId');
    if (!userId) return;

    try {
      const response = await fetch(`http://localhost:4000/user/${userId}/played`);
      const data = await response.json();
      setIsPlayed(data.played_game_ids?.includes(parseInt(id)));
    } catch (error) {
      console.error('Error checking played status:', error);
    }
  }

  async function fetchRating() {
    const userId = Cookies.get('userId');
    if (!userId) return;

    try {
      const response = await fetch(`http://localhost:4000/user/${userId}/game/${id}/rating`);
      const data = await response.json();
      setRating(data.rating);
    } catch (error) {
      console.error('Error fetching rating:', error);
    }
  }

  async function handleFavoriteToggle() {
    const userId = Cookies.get('userId');
    if (!userId) {
      Notiflix.Notify.failure("You must be logged in to favorite a game!");
      return;
    }

    setFavoriteLoading(true);

    try {
      const method = isFavorite ? 'DELETE' : 'POST';
      const response = await fetch(`http://localhost:4000/user/${userId}/favorite/${id}`, { method });

      if (response.ok) {
        setIsFavorite(prev => !prev);
        Notiflix.Notify.success(isFavorite ? "Removed from Favorites!" : "Added to Favorites!");
      } else {
        Notiflix.Notify.failure("Failed to update favorite status");
      }
    } catch (error) {
      Notiflix.Notify.failure("Error updating favorite status");
      console.error('Error:', error);
    } finally {
      setFavoriteLoading(false);
    }
  }

  async function handlePlayedToggle() {
    const userId = Cookies.get('userId');
    if (!userId) {
      Notiflix.Notify.failure("You must be logged in to mark as played!");
      return;
    }

    setPlayedLoading(true);

    try {
      const method = isPlayed ? 'DELETE' : 'POST';
      const response = await fetch(`http://localhost:4000/user/${userId}/played/${id}`, { method });

      if (response.ok) {
        setIsPlayed(prev => !prev);
        Notiflix.Notify.success(isPlayed ? "Unmarked as Played!" : "Marked as Played!");
      } else {
        Notiflix.Notify.failure("Failed to update played status");
      }
    } catch (error) {
      Notiflix.Notify.failure("Error updating played status");
      console.error('Error:', error);
    } finally {
      setPlayedLoading(false);
    }
  }

  async function handleStarClick(selectedRating) {
    const userId = Cookies.get('userId');
    if (!userId) {
      Notiflix.Notify.failure("You must be logged in to rate a game!");
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/user/${userId}/game/${id}/rating`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: selectedRating }),
      });

      if (response.ok) {
        setRating(selectedRating);
        Notiflix.Notify.success('Rating updated!');
      } else {
        Notiflix.Notify.failure('Failed to update rating');
      }
    } catch (error) {
      Notiflix.Notify.failure('Error updating rating');
      console.error('Error:', error);
    }
  }

  if (loading) return <p>Loading...</p>;
  if (!game) return <p>Game not found.</p>;

  return (
    <div className="game-details-container">
      <div className="main-info">
        {game.cover && (
          <img
            className="game-cover"
            src={game.cover.url.replace('t_thumb', 't_cover_big')}
            alt={`${game.name} Cover`}
          />
        )}
        <div className="game-text">
          <h1>{game.name}</h1>
          <p><strong>Genres:</strong> {game.genres?.map(g => g.name).join(', ') || 'N/A'}</p>
          <p><strong>Summary:</strong> {game.summary || 'No summary available.'}</p>
          {game.first_release_date && (
            <p><strong>Release Date:</strong> {new Date(game.first_release_date * 1000).toLocaleDateString()}</p>
          )}
          <p><strong>Platforms:</strong> {game.platforms?.map(p => p.name).join(', ') || 'N/A'}</p>
          <p><strong>Rating:</strong> {game.rating ? `${Math.round(game.rating)} / 100` : 'Not rated'}</p>
          <p><strong>Developers:</strong> {game.involved_companies?.map(dev => dev.company?.name).join(', ') || 'N/A'}</p>

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteToggle}
            className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
            disabled={favoriteLoading}
          >
            {favoriteLoading ? 'Loading...' : isFavorite ? '★ Unfavorite' : '☆ Favorite'}
          </button>

          {/* Played Button */}
          <button
            onClick={handlePlayedToggle}
            className={`played-btn ${isPlayed ? 'played' : ''}`}
            disabled={playedLoading}
            style={{ 
              marginLeft: '10px', 
              backgroundColor: isPlayed ? 'gold' : 'lightgray',
              color: 'black',
              fontWeight: 'bold',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
          >
            {playedLoading ? 'Loading...' : isPlayed ? '✔ Played' : '▶ Mark as Played'}
          </button>

          {/* Rating Section */}
          {/* Rating Section */}
          <div style={{ marginTop: '20px' }}>
          <h3>Rate this game:</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                  key={star}
                  size={30}
                  color={(hoverRating || rating) >= star ? 'gold' : 'lightgray'}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleStarClick(star)}
                  style={{ transition: 'color 0.2s' }}
                />
              ))}
          {rating > 0 && (
            <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>
                {`You rated this ${rating} out of 5`}
            </span>
                  )}
              </div>
            </div>


        </div>
      </div>

      {/* Trailer */}
      {game.videos && game.videos.length > 0 && (
        <div className="game-trailer">
          <h2>Trailer</h2>
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${game.videos[0].video_id}`}
            title="Game Trailer"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      )}

      {/* Screenshots */}
      {game.screenshots && game.screenshots.length > 0 && (
        <div className="game-screenshots">
          <h2>Screenshots</h2>
          <div className="screenshots-grid">
            {game.screenshots.map((shot, index) => (
              <img
                key={index}
                src={shot.url.replace('t_thumb', 't_screenshot_big')}
                alt={`Screenshot ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
