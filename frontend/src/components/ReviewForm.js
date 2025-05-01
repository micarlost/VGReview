import React, { useState } from 'react';
import Cookies from 'js-cookie';
import Notiflix from 'notiflix';
import './ReviewForm.css';

export default function ReviewForm({ onAddReview }) {
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const userId = Cookies.get('userId');
    if (!userId) {
      Notiflix.Notify.failure('You must be logged in to submit a review!');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          gameId: window.location.pathname.split('/')[2],
          review,
          rating,
        }),
      });

      if (response.ok) {
        setReview('');
        setRating(0);
        onAddReview(); // Fetch new reviews
        Notiflix.Notify.success('Review submitted!');
      } else {
        Notiflix.Notify.failure('Failed to submit review');
      }
    } catch (error) {
      Notiflix.Notify.failure('Error submitting review');
      console.error('Error:', error);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="Write your review..."
        required
      />
      <div className="review-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => setRating(star)}
            style={{ cursor: 'pointer', color: rating >= star ? 'gold' : 'lightgray' }}
          >
            ★
          </span>
        ))}
      </div>
      <button type="submit" disabled={review.trim() === ''}>
        Submit Review
      </button>
    </form>
  );
}
