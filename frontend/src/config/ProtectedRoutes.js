import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

// Check if user is authenticated
const isAuthenticated = () => {
  const token = Cookies.get('token');
  return token ? true : false;
};

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;