import React from 'react';
import mario from "../images/mario.png";
import link from "../images/The_Legend_of_Zelda_Breath_of_the_Wild.png";
import acnh from "../images/acnh.png";
import { Link } from 'react-router-dom';
export default function GameList() {
  // Example static data for games
  const games = [
    {
      id: 1,  
      name: "The Legend of Zelda: Breath of the Wild",
      genre: "Action-Adventure",
      summary: "Explore the vast kingdom of Hyrule in this open-world adventure.",
      cover: link,
    },
    {
      id: 2,  
      name: "Super Mario Odyssey",
      genre: "Platformer",
      summary: "Join Mario in an exciting journey to save Princess Peach!",
      cover: mario,
    },
    {
      id: 3,  
      name: "Animal Crossing: New Horizons",
      genre: "Simulation",
      summary: "Build your island paradise and live the dream life in this relaxing simulation game.",
      cover: acnh,
    },
  ];

  return (
    <div>
      <h1 style={{ color: 'white', fontSize: '36px', textAlign: 'center' }}>Top 3 Games</h1>
      <div className="game-list">
        {games.map((game) => (
          <div key={game.name} className="game" style={{ color: 'white' }}>
            <Link to={`/game/${game.id}`} className="game-link"> 
              <img
                src={game.cover}
                alt={`${game.name} Cover`}
                style={{ width: '300px', height: 'auto', borderRadius: '8px' }}
              />
            </Link>
            <h2 style={{ fontSize: '24px', color: 'white' }}>{game.name}</h2>
            <p style={{ fontSize: '18px', color: 'white' }}>{game.genre}</p>
            <p style={{ fontSize: '16px', color: 'white' }}>{game.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
