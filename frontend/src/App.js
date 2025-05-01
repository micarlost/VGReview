import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import { NotFound } from './pages/NotFound';
import { HealthCheck } from './pages/HealthCheck';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import Profile from './pages/Profile';  // New Profile page
import { Account } from './pages/Account';
import SearchResults from "./pages/SearchResults"; // Adjust path as needed
import GameDetails from './pages/GameDetails';
import ProtectedRoute from "./config/ProtectedRoutes";
import GameList from './components/GameList';
import { UpdateAccount } from './pages/UpdateAccount';
import Following from './pages/Following'; // Import Following page

export default function App() {
  const [games, setGames] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/`)  // Endpoint for health check
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then((data) => {
        setMessage(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/games`)  // Fetch games
      .then((response) => response.json())
      .then((data) => setGames(data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            // Pass games as prop to Home or GameList
            <Home games={games} ApiStatus={message} />
          }
        />
        <Route path="/games" element={<GameList games={games} />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/health" element={<HealthCheck />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Profile Page - View only, anyone can access */}
        <Route path="/profile/:userId" element={<Profile />} />

        {/* Protected Account Page - Only accessible to logged-in users */}
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/following/:userId" element={<Following />} />
        {/* Other routes */}
        <Route path="/search" element={<SearchResults />} />
        <Route path="/games/:id" element={<GameDetails />} />
        <Route path="/updateaccount" element={<ProtectedRoute><UpdateAccount /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}
