import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import Notiflix from 'notiflix';
import { FaStar } from 'react-icons/fa';
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
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingFetched, setRatingFetched] = useState(false); 
  const [reviews, setReviews] = useState([]);
  const [newReviewContent, setNewReviewContent] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [hoverReviewRating, setHoverReviewRating] = useState(0);
  const [reviewRating, setReviewRating] = useState(0);


  useEffect(() => {
    fetchGame();
    checkFavoriteStatus();
    checkPlayedStatus();
    fetchRating();
    fetchReviews();
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
    } finally {
      setRatingFetched(true); // <-- make sure we know rating was fetched
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

  async function fetchReviews() {
    try {
      const response = await fetch(`http://localhost:4000/reviews?game_id=${id}`);
      const data = await response.json();
      const reviews = data.reviews || [];
  
      // Fetch user data in parallel and cache by account_id
      const userCache = {};
      const reviewsWithUsers = await Promise.all(
        reviews.map(async (review) => {
          const { account_id } = review;
          if (!userCache[account_id]) {
            const userRes = await fetch(`http://localhost:4000/user/${account_id}`);
            const userData = await userRes.json();
            userCache[account_id] = userData;
          }
          return { ...review, user: userCache[account_id] };
        })
      );
  
      setReviews(reviewsWithUsers);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }
  

  async function handleStarClick(selectedRating) {
    const userId = Cookies.get('userId');
    if (!userId) {
      Notiflix.Notify.failure("You must be logged in to rate a game!");
      return;
    }

    const url = `http://localhost:4000/user/${userId}/rating/${id}`;

    try {
      let response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: selectedRating }),
      });

      if (response.ok) {
        setRating(selectedRating);
        Notiflix.Notify.success('Rating updated!');
        return;
      }

      if (response.status === 404 || response.status === 400) {
        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating: selectedRating }),
        });

        if (response.ok) {
          setRating(selectedRating);
          Notiflix.Notify.success('Rating added!');
        } else {
          Notiflix.Notify.failure('Failed to add rating');
        }
      } else {
        Notiflix.Notify.failure('Failed to update rating');
      }
    } catch (error) {
      Notiflix.Notify.failure('Error saving rating');
      console.error('Error:', error);
    }
  }


  const handleSubmitReview = async (e) => {
    e.preventDefault();
  
    if (!newReviewContent.trim() || reviewRating  < 1 || reviewRating  > 5) {
      Notiflix.Notify.failure('Please provide valid content and rating (1-5).');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:4000/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newReviewContent,
          rating: newReviewRating,
          game_id: Number(id),
          account_id: Number(Cookies.get('userId')),
        }),
      });
  
      if (response.ok) {
        Notiflix.Notify.success('Review submitted!');
        setNewReviewContent(''); // Clear the review content
        setNewReviewRating(5);    // Reset the rating to 5 (or any default value)
        fetchReviews();           // Refresh the reviews
      } else {
        const errorData = await response.json();
        Notiflix.Notify.failure(errorData.error || 'Failed to submit review.');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      Notiflix.Notify.failure('Error submitting review');
    }
  };

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

          <div style={{ marginTop: '20px' }}>
  <h3>Rate this game:</h3>
  {ratingFetched ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = hoverRating ? hoverRating >= star : rating >= star;
        const color = hoverRating
          ? hoverRating >= star ? 'red' : 'lightgray'
          : rating >= star ? 'gold' : 'lightgray';

        return (
          <FaStar
            key={star}
            size={30}
            color={color}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => handleStarClick(star)}
            style={{ transition: 'color 0.2s' }}
          />
        );
      })}
      {rating > 0 && (
        <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>
          {`You rated this ${rating} out of 5`}
        </span>
      )}
    </div>
  ) : (
    <p>Loading your rating...</p>
  )}
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

<div className="reviews-section" style={{ marginTop: '40px' }}>
  <h2>Recent Reviews</h2>
  {reviews.length > 0 ? (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {reviews.map((review) => (
        <div
          key={review.id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '15px',
            border: '1px solid #ddd',
            borderRadius: '10px',
            backgroundColor: '#f9f9f9',
          }}
        >
          <p><strong>Account ID:</strong> {review.account_id}</p>
          <p><strong>Description:</strong> {review.content}</p>
          <p><strong>Rating:</strong> {review.rating}</p>
        </div>
      ))}
    </div>
  ) : (
    <p style={{ fontStyle: 'italic', color: '#888', marginTop: '10px' }}>
      No current reviews, be the first to post!
    </p>
  )}
</div>


      {/* Review Section */}
      <div className="reviews-section" style={{ marginTop: '40px' }}>
        <h2>Write a Review</h2>
        {Cookies.get('userId') ? (
          <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '600px' }}>
          <textarea
            placeholder="Write your review..."
            value={newReviewContent}
            onChange={(e) => setNewReviewContent(e.target.value)}
            rows={4}
            style={{
              padding: '10px',
              borderRadius: '5px',
              resize: 'vertical',
              backgroundColor: '#f0f0f0', // grey background
              color: 'black', // black text
            }}
            required
          />
          <label>
  Rating:
  <div style={{ display: 'flex', gap: '5px', marginLeft: '10px', cursor: 'pointer' }}>
    {[1, 2, 3, 4, 5].map((star) => {
      const color = hoverReviewRating
        ? hoverReviewRating >= star ? 'red' : 'lightgray'
        : reviewRating >= star ? 'gold' : 'lightgray';

      return (
        <FaStar
          key={star}
          size={30}
          color={color}
          onMouseEnter={() => setHoverReviewRating(star)}
          onMouseLeave={() => setHoverReviewRating(0)}
          onClick={() => setReviewRating(star)}
          style={{ transition: 'color 0.2s' }}
        />
      );
    })}
    {reviewRating > 0 && (
      <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>
        {`${reviewRating} out of 5`}
      </span>
    )}
  </div>
</label>

          <button
            type="submit"
            style={{
              backgroundColor: '#D64B4B', // Darker red
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Submit Review
          </button>
        </form>
        ) : (
          <p style={{ fontStyle: 'italic', color: '#888' }}>
            You must be logged in to post a review.
          </p>
        )}
      </div>
    </div>
  );
}
