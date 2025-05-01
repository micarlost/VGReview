import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate, Link } from 'react-router-dom';

export function Account() {
    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userId = Cookies.get('userId');

        if (!userId) {
            setError('User ID not found');
            return;
        }

        // Fetch user info
        fetch(`http://localhost:4000/user/${userId}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                setUserInfo(data.user);
            })
            .catch((error) => setError(error.message));
    }, []);

    const handleLogout = () => {
        Cookies.remove('token');
        Cookies.remove('userId');
        setUserInfo(null);
        navigate('/login', { replace: true });
        window.location.reload();
    };

    if (error) return <p className="text-white">Error: {error}</p>;
    if (!userInfo) return <p className="text-white">Loading...</p>;

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 space-y-6">
            {/* Profile Picture */}
            <img
                src={`http://localhost:4000/${userInfo.profile_pic}`}
                alt={"defaultProfilePic"}
                className="w-24 h-24 rounded-full object-cover shadow-md"
            />

            {/* Username */}
            <h1 className="text-4xl font-bold text-white">{userInfo.username}</h1>

            {/* Bio */}
            <p className="text-gray-400 text-center max-w-md">{userInfo.bio}</p>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="mt-4 px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
                Logout
            </button>

            {/* Edit Account Button */}
            <Link to="/updateaccount" className="mt-4">
                <button className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                    Edit Account
                </button>
            </Link>
        </div>
    );
}
