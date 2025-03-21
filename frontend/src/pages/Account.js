import React, { useEffect, useState } from 'react';
import { IdentificationIcon, UserCircleIcon, TrashIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/solid';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import Notiflix from 'notiflix';

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

    const handleDeleteSubmit = async (e) => {
        e.preventDefault();
        const userId = Cookies.get('userId');

        try {
            const response = await fetch("http://localhost:4000/delete", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: userId,
                    password: formData.password,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                Notiflix.Notify.success("Account Deleted successfully!");
                Cookies.remove('token');
                Cookies.remove('userId');
                navigate('/', { replace: true });
                window.location.reload();
            } else {
                Notiflix.Notify.failure(data.message);
            }
        } catch {
            Notiflix.Notify.failure("Error occurred during deletion");
        }
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
            case 'deleteAccount':
                return (
                    <section>
                        <h1 className="text-2xl font-bold mb-4">Delete Account</h1>
                        <form onSubmit={handleDeleteSubmit} className="max-w-lg">
                            <div className="mb-4">
                                <label className="block text-white text-sm font-bold mb-2">Confirm with your Password</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                <button
                                    type="button"
                                    className="mt-2 text-sm text-blue-500"
                                    onClick={toggleShowPassword}
                                >
                                    {showPassword ? "Hide Password" : "Show Password"}
                                </button>
                            </div>
                            <button
                                type="submit"
                                className="bg-red-500 text-white font-bold py-2 px-4 rounded-md hover:bg-red-600 transition-colors duration-300"
                            >
                                Delete Account
                            </button>
                        </form>
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
        <div className="min-h-screen bg-white flex">
            {/* Sidebar */}
            <aside className="bg-white p-6 shadow-md">
                <nav>
                    <ul className="flex flex-col">
                        <li>
                            <button
                                className={`text-left w-full py-2 px-4 rounded-md hover:bg-white transition-colors ${activeSection === 'accountInfo' ? 'bg-white font-bold' : ''}`}
                                onClick={() => setActiveSection('accountInfo')}
                            >
                                <IdentificationIcon className="h-6 w-6" title='Account Informations' />
                            </button>
                        </li>
                        <li>
                            <button
                                className={`text-left w-full py-2 px-4 rounded-md hover:bg-white transition-colors ${activeSection === 'updateAccount' ? 'bg-white font-bold' : ''}`}
                                onClick={() => setActiveSection('updateAccount')}
                            >
                                <UserCircleIcon className="h-6 w-6" title='Update Account Informations' />
                            </button>
                        </li>
                        <li>
                            <button
                                className={`text-left w-full py-2 px-4 rounded-md hover:bg-white transition-colors ${activeSection === 'deleteAccount' ? 'bg-white font-bold' : ''}`}
                                onClick={() => setActiveSection('deleteAccount')}
                            >
                                <TrashIcon className="h-6 w-6" title='Delete Account' />
                            </button>
                        </li>
                        <li>
                            <button
                                className={`text-left w-full py-2 px-4 rounded-md hover:bg-white transition-colors ${activeSection === 'logoutAccount' ? 'bg-white font-bold' : ''}`}
                                onClick={() => setActiveSection('logoutAccount')}
                            >
                                <ArrowRightStartOnRectangleIcon className="h-6 w-6" title='Logout of Account' />
                            </button>
                        </li>
                    </ul>
                </nav>
            </aside>

            <main className="flex-1 p-8 bg-white ml-4">
                {renderSection()}
            </main>
        </div>
    );
}