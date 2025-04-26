import React, { useState } from "react";
import Cookies from 'js-cookie'
import Notiflix from 'notiflix';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export function Login() {
    const navigate                = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:4000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();
            console.log(data);
            if (response.ok) {
                Notiflix.Notify.success("Login successful!");
                Cookies.set('token', data.token, { expires: 1, sameSite: 'none', secure: true });
                Cookies.set('userId', data.user.ID, { expires: 1, sameSite: 'none', secure: true });
                setTimeout(() => {
                    navigate('/games', { replace: true });
                    window.location.reload();
                }, 1000);
            } else {
                Notiflix.Notify.failure(data.message || "Login failed");
            }
        } catch (error) {
            Notiflix.Notify.failure("Error occurred during login");
        }
    };

    return (
        <div className="min-h-screen bg-black-100 flex items-center justify-center">
            <div className="bg-black p-8 rounded-lg shadow-lg w-full max-w-md border-2 border-white">
                <h2 className="text-2xl font-bold mb-6 text-white text-center">Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-white text-sm font-bold mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-white text-sm font-bold mb-2">Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                        />
                        <button
                            type="button"
                            className="mt-2 text-sm text-red-500"
                            onClick={toggleShowPassword}
                        >
                            {showPassword ? "Hide Password" : "Show Password"}
                        </button>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded-md hover:bg-red-600 transition-colors duration-300"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}