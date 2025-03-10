import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

import { Home } from './components/pages/Home';
import { NotFound } from './components/pages/NotFound';
import { HealthCheck } from './components/pages/HealthCheck';
import { Login } from './components/pages/Login';
import { Signup } from './components/pages/Signup';
import { Account } from './components/pages/Account';

import ProtectedRoute from "./config/ProtectedRoutes";

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
        <Route path='/' element={<Home games={games} ApiStatus={message} />} />
        <Route path='*' element={<NotFound />} />
        <Route path='/health' element={<HealthCheck />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/account' element={<ProtectedRoute><Account /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}