import React, { useState } from "react";
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import Notiflix from 'notiflix';

export function Signup() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [message, setMessage] = useState("");
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

        // Password strength checks
        if (formData.password.length < 8) {
            setMessage("Password must be at least 8 characters long.");
            return;
        }
        if (!/\d/.test(formData.password)) {
            setMessage("Password must contain at least one number.");
            return;
        }
        if (!/[A-Z]/.test(formData.password)) {
            setMessage("Password must contain at least one uppercase letter.");
            return;
        }
        if (!/[a-z]/.test(formData.password)) {
            setMessage("Password must contain at least one lowercase letter.");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        try {
            const response = await fetch("http://localhost:4000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    confirm_password: formData.confirmPassword,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                Notiflix.Notify.success("Registration successful! Redirecting to login...");
                setTimeout(() => {
                    window.location.href = "/account";
                }, 2000);
            } else {
                Notiflix.Notify.failure(data.message || "Registration failed");
            }
        } catch (error) {
            Notiflix.Notify.failure("Error occurred during registration");
        }
    };

    const checkMark = <CheckCircleIcon className="h-4 w-4 text-green-500" />;
    const xMark     = <XCircleIcon className="h-4 w-4 text-red-500" />;

    return (
        <div className="min-h-screen bg-black-100 flex items-center justify-center">
            <div className="bg-black p-8 rounded-lg shadow-lg w-full max-w-md border-2 border-white">
                <h2 className="text-2xl font-bold mb-6 text-white text-center">Sign Up</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-white text-sm font-bold mb-2">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                        />
                    </div>
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
                    <div className="mb-4">
                        <label className="block text-white text-sm font-bold mb-2">Confirm Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded-md hover:bg-red-600 transition-colors duration-300"
                    >
                        Sign Up
                    </button>
                </form>
                {message && <p className="mt-4 text-red-500 text-center">{message}</p>}

                <div className="text-sm text-white">
                    <br />
                    <span>Passwords Must:</span>
                    <ul>
                        <li>
                            <span className="icon-mark">
                                {formData.password.length > 8 ? checkMark : xMark} <span className="ml-2">Be at least 8 characters long</span>
                            </span>
                        </li>
                        <li>
                            <span className="icon-mark">
                                {/\d/.test(formData.password) ? checkMark : xMark}
                                <span className="ml-2">Contain at least one number</span>
                            </span>
                        </li>
                        <li>
                            <span className="icon-mark">
                                {/[A-Z]/.test(formData.password) ? checkMark : xMark}
                                <span className="ml-2">Contain at least one uppercase letter</span>
                            </span>
                        </li>
                        <li>
                            <span className="icon-mark">
                                {/[a-z]/.test(formData.password) ? checkMark : xMark}
                                <span className="ml-2">Contain at least one lowercase letter</span>
                            </span>
                        </li>
                        <li>
                            <span className="icon-mark">
                                {formData.password !== "" && formData.password === formData.confirmPassword ? checkMark : xMark}
                                <span className="ml-2">Password must match Confirm Password</span>
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}