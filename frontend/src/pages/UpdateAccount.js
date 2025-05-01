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
    const [imagePreview, setImagePreview] = useState(null);
    const [zoom, setZoom] = useState(1); // To handle zoom functionality
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
        let success = true;

        // Update Bio
        const bioRes = await fetch(`http://localhost:4000/user/${userId}/profile-description`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bio }),
        });

        if (!bioRes.ok) {
            Notiflix.Notify.failure('Failed to update bio');
            success = false;
        }

        // Update Username
        const usernameRes = await fetch(`http://localhost:4000/update-username`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, username }),
        });

        if (!usernameRes.ok) {
            Notiflix.Notify.failure('Failed to update username');
            success = false;
        }

        // Upload Profile Picture (only if a file is selected)
        if (file) {
            const formData = new FormData();
            formData.append('profile_pic', file);

            const picRes = await fetch(`http://localhost:4000/user/${userId}/profile-pic`, {
                method: 'POST', // <-- fixed from PUT to POST
                body: formData,
            });

            if (!picRes.ok) {
                Notiflix.Notify.failure('Failed to upload profile picture');
                success = false;
            }
        }

        if (success) {
            Notiflix.Notify.success('Profile updated!');
            window.location.reload();
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const fileType = selectedFile.type;
            if (fileType === 'image/jpeg' || fileType === 'image/png') {
                setFile(selectedFile);
                setImagePreview(URL.createObjectURL(selectedFile));
            } else {
                Notiflix.Notify.failure('Only JPEG and PNG files are allowed');
                setFile(null);
                setImagePreview(null);
            }
        }
    };

    const handleZoomIn = () => {
        setZoom((prevZoom) => Math.min(prevZoom + 0.1, 3)); // Max zoom level of 3
    };

    const handleZoomOut = () => {
        setZoom((prevZoom) => Math.max(prevZoom - 0.1, 1)); // Min zoom level of 1
    };

    if (error) return <p className="text-red-500">Error: {error}</p>;
    if (!userInfo) return <p className="text-gray-700">Loading...</p>;

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 space-y-6">
            {/* Profile Picture */}
            <div className="relative mb-4">
                <img
                    src={imagePreview || `http://localhost:4000/${userInfo.profile_pic}`}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover shadow-md"
                    style={{
                        transform: `scale(${zoom})`,
                        transition: 'transform 0.2s ease-in-out',
                    }}
                />
            </div>

            {/* Zoom Controls */}
            <div className="mb-4">
                <button
                    onClick={handleZoomIn}
                    className="text-white bg-red-500 rounded-full p-2 mx-2"
                >
                    +
                </button>
                <button
                    onClick={handleZoomOut}
                    className="text-white bg-red-500 rounded-full p-2 mx-2"
                >
                    -
                </button>
            </div>

            {/* File input for profile picture */}
            <div className="mb-4">
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="p-2 bg-red-500 text-white rounded"
                />
            </div>

            {/* Username */}
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="p-2 border border-red-500 rounded w-full max-w-xs mt-4"
                placeholder="Username"
            />

            {/* Bio */}
            <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="p-2 border border-red-500 rounded w-full max-w-xs mt-4"
                placeholder="Write something about yourself"
            />

            {/* Save Changes Button */}
            <button
                onClick={handleProfileUpdate}
                className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 mt-4"
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
