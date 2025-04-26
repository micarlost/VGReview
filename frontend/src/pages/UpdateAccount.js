import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import Notiflix from 'notiflix';

export function UpdateAccount() {
    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState(null);
    const [bio, setBio] = useState('');
    const [username, setUsername] = useState('');
    const [file, setFile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userId = Cookies.get('userId');
        if (!userId) {
            setError('User ID not found');
            return;
        }

        fetch(`http://localhost:4000/user/${userId}`)
            .then((res) => res.json())
            .then((data) => {
                setUserInfo(data.user);
                setBio(data.user.bio || '');
                setUsername(data.user.username || '');
            })
            .catch((err) => setError(err.message));
    }, []);

    const handleLogout = () => {
        Cookies.remove('token');
        Cookies.remove('userId');
        navigate('/login', { replace: true });
        window.location.reload();
    };

    const handleProfileUpdate = async () => {
        const userId = Cookies.get('userId');

        // Update Bio
        await fetch(`http://localhost:4000/user/${userId}/bio`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bio }),
        });

        // Update Username
        await fetch(`http://localhost:4000/update-username`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, username }),
        });

        // Upload Profile Picture
        if (file) {
            const formData = new FormData();
            formData.append('profile_pic', file);
            await fetch(`http://localhost:4000/user/${userId}/profile-pic`, {
                method: 'PUT',
                body: formData,
            });
        }

        Notiflix.Notify.success('Profile updated!');
        window.location.reload();
    };

    if (error) return <p className="text-red-500">Error: {error}</p>;
    if (!userInfo) return <p className="text-gray-700">Loading...</p>;

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 space-y-6">
            {/* Profile Picture */}
            <img
                src={`http://localhost:4000/${userInfo.profile_pic}`}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover shadow-md"
            />

            <input type="file" onChange={(e) => setFile(e.target.files[0])} />

            {/* Username */}
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="p-2 border rounded w-full max-w-xs"
                placeholder="Username"
            />

            {/* Bio */}
            <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="p-2 border rounded w-full max-w-xs"
                placeholder="Write something about yourself"
            />

            {/* Save Changes */}
            <button
                onClick={handleProfileUpdate}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Save Changes
            </button>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="mt-4 px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
                Logout
            </button>
        </div>
    );
}
