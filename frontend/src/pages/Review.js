import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import './Review.css';

export default function ReviewPage() {
  const { reviewId } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReview() {
      try {
        const response = await fetch(`http://localhost:4000/reviews/${reviewId}`);
        if (!response.ok) throw new Error('Review not found');
        const reviewData = await response.json();

        // Enrich with game data
        const gameResponse = await fetch(`http://localhost:4000/api/games/${reviewData.game_id}`);
        if (!gameResponse.ok) throw new Error('Game data not found');
        const gameData = await gameResponse.json();

        setReview({
          ...reviewData,
          gameName: gameData.name,
          gameCover: gameData.cover?.url || null,
        });
      } catch (err) {
        setError(err.message || 'Failed to load review');
      } finally {
        setLoading(false);
      }
    }

    fetchReview();

    
  }, [reviewId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!review) return <p>Review not found.</p>;

  return (
    <div className="max-w-2xl mx-auto bg-gray-900 text-white p-6 rounded-lg shadow-md space-y-4">
      <div className="flex flex-col items-center space-y-2">
        <img
          src={`http://localhost:4000/${review.user?.profile_pic || 'default.jpg'}`}
          alt="User"
          className="w-20 h-20 rounded-full object-cover"
        />
        <h2 className="text-xl font-bold">{review.user?.username || 'Anonymous'}</h2>
        <p className="text-sm text-gray-400">
          {new Date(review.created_at).toLocaleDateString()}
        </p>
      </div>

      <h1 className="text-3xl font-bold text-center">{review.gameName || 'Unknown Game'}</h1>

      {review.gameCover && (
        <img
          src={review.gameCover.replace('t_thumb', 't_cover_big')}
          alt={review.gameName}
          className="w-full h-64 object-cover rounded-md"
        />
      )}

      <div className="flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            size={24}
            color={review.rating >= star ? 'gold' : 'lightgray'}
          />
        ))}
      </div>

      <p className="text-lg text-gray-200">{review.content || 'No review content available.'}</p>
    </div>
  );
}
