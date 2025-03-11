import React, { useState } from "react";
import defaultProfilePic from "../images/Default_pfp.png"; // Placeholder profile image
import "./ReviewForm.css";
export default function ReviewForm({ onAddReview }) {
  const [reviewText, setReviewText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (reviewText.trim() === "") return; // Prevent empty reviews

    // Create a new review object
    const newReview = {
      author: "Guest", // You can replace this with the logged-in user's name
      review: reviewText,
      profilePicture: defaultProfilePic, // Placeholder profile image
    };

    onAddReview(newReview); // Call the function to add the review
    setReviewText(""); // Clear input field after submission
  };

  return (
    <div className="review-form">
      <h3>Write a Review</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Write your review here..."
          className="review-input"
        />
        <button type="submit" className="submit-review">Submit</button>
      </form>
    </div>
  );
}
