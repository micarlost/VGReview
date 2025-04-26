import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import Notiflix from 'notiflix';
import defaultProfilePic from "../images/Default_pfp.png"; 
import { Link } from 'react-router-dom';  

export function Account() {
    const [userInfo, setUserInfo]           = useState(null);
    const [error, setError]                 = useState(null);
    const [formData, setFormData]           = useState({ password: "" });
    const [showPassword, setShowPassword]   = useState(false);
    const [activeSection, setActiveSection] = useState('accountInfo');
    const navigate                          = useNavigate();

    useEffect(() => {
        const userId = Cookies.get('userId');

        if (!userId) {
            setError('User ID not found');
            return;
        }

        fetch(`http://localhost:4000/user/${userId}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => setUserInfo(data.user))
            .catch((error) => setError(error.message));
    }, []);
    const handleLogout = () => {
        Cookies.remove('token');
        Cookies.remove('userId');
        setUserInfo(null)
        navigate('/login', { replace: true });
        window.location.reload();
    };

    const toggleShowPassword = () => setShowPassword(!showPassword);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    
    if (error) return <p className="text-white">Error: {error}</p>;
    if (!userInfo) return <p className="text-white">Loading...</p>;

    const renderSection = () => {
        switch (activeSection) {
            case 'accountInfo':
                return (
                    <section>
                        <h1 className="text-2xl font-bold mb-4">Account Informations</h1>
                        <p className="text-white mb-2"><b>Email</b>: {userInfo.email}</p>
                        <p className="text-white mb-2"><b>Username</b>: {userInfo.username}</p>
                    </section>
                );
            case 'updateAccount':
                return (
                    <section>
                        <h1 className="text-2xl font-bold mb-4">Update Account</h1>
                        <p>Not implemented, yet!</p>
                    </section>
                );

            case 'logoutAccount':
                return (
                    <section>
                        <h1 className="text-2xl font-bold mb-4">Logout Of Account</h1>
                        <p>Click the button below to logout</p>
                        <button
                            onClick={handleLogout}
                            type="submit"
                            className="mt-2 bg-red-500 text-white font-bold py-2 px-4 rounded-md hover:bg-red-600 transition-colors duration-300"
                        >
                            Logout
                        </button>
                    </section>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 space-y-6">
            {/* Profile Picture */}
            <img
                src={userInfo.profilePicture || defaultProfilePic} // replace with actual image URL
                alt= {"defaultProfilePic"}
                className="w-24 h-24 rounded-full object-cover shadow-md"
            />
    
            {/* Username */}
            <h1 className="text-4xl font-bold text-black">{userInfo.username}</h1>
    
            {/* Bio */}
            <p className="text-gray-600 text-center max-w-md">{userInfo.bio}</p>
    
            {/* Logout Button */}
            <button
                onClick={handleLogout} // your logout function here
                className="mt-4 px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
                Logout
            </button>
            {/* Edit Account Button */}
            <Link to="/updateaccount" className="mt-4">
                <button className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                    Edit Account
                </button>
            </Link>
        </div>
    );
}