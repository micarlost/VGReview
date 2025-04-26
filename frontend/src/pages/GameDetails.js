import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import mario from "../images/mario.png";
import link from "../images/The_Legend_of_Zelda_Breath_of_the_Wild.png";
import acnh from "../images/acnh.png";
import sabrina from "../images/sabrina.png"; // Default profile picture if no profile is provided
import soundwave from "../images/soundwave.png"
import ReviewForm from "../components/ReviewForm"; 
export default function GameDetails() {
    const { id } = useParams();
    const [game, setGame] = useState(null);
    const [reviews, setReviews] = useState([
      {
        author: "Sabrina Carpenter",
        review: "It's Aight.",
        profilePicture: sabrina,
      },
      {
        author: "Soundwave",
        review: "Cool I think.",
        profilePicture: soundwave,
      },
    ]);
  
    useEffect(() => {
      const gameData = {
        1: {
          name: "The Legend of Zelda: Breath of the Wild",
          genre: "Action-Adventure",
          summary: "Explore the vast kingdom of Hyrule in this open-world adventure.",
          cover: link,
        },
        2: {
          name: "Super Mario Odyssey",
          genre: "Platformer",
          summary: "Join Mario in an exciting journey to save Princess Peach!",
          cover: mario,
        },
        3: {
          name: "Animal Crossing: New Horizons",
          genre: "Simulation",
          summary: "Build your island paradise and live the dream life in this relaxing simulation game.",
          cover: acnh,
        },
      };
  
      setGame(gameData[id]);
    }, [id]);
  
    const addReview = (newReview) => {
      setReviews([...reviews, newReview]); // Add new review to state
    };
  
    if (!game) return <p>Loading...</p>;
  
    return (
      <div>
        <h1 style={{ color: "white" }}>{game.name}</h1>
        <img 
            src={game.cover} 
            alt={`${game.name} Cover`} 
            style={{ width: "300px", height: "400px", objectFit: "cover", borderRadius: "8px" }} 
        />
        <p style={{ color: "white" }}>{game.genre}</p>
        <p style={{ color: "white" }}>{game.summary}</p>
  
        <div style={{ marginTop: "20px" }}>
          <h2 style={{ color: "white" }}>Reviews</h2>
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <div key={index} style={{ marginBottom: "10px", display: "flex", alignItems: "center" }}>
                <img
                  src={review.profilePicture}
                  alt={`${review.author}'s profile`}
                  style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "10px" }}
                />
                <div>
                  <p style={{ color: "white" }}>
                    <strong>{review.author}:</strong> {review.review}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: "white" }}>No reviews yet.</p>
          )}
        </div>
  
        {/* Review Form */}
        <ReviewForm onAddReview={addReview} />
      </div>
    );
  }
  