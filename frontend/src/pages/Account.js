import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate, Link } from 'react-router-dom';

export function Account() {
    const [userInfo, setUserInfo] = useState(null);
    const [favoriteGames, setFavoriteGames] = useState([]);
    const [playedGames, setPlayedGames] = useState([]);
    const [ratedGames, setRatedGames] = useState([]); // 🆕 Added Rated Games
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

                // Fetch favorite games
                fetch(`http://localhost:4000/user/${userId}/favorite`)
                    .then((response) => {
                        if (!response.ok) throw new Error('Failed to fetch favorite games');
                        return response.json();
                    })
                    .then((favoriteData) => {
                        const gameIDs = favoriteData.favorite_game_ids || [];
                        Promise.all(
                            gameIDs.map(id =>
                                fetch(`http://localhost:4000/api/games/${id}`).then(res => res.json())
                            )
                        ).then(games => setFavoriteGames(games))
                         .catch(err => console.error("Error fetching favorite games:", err));
                    })
                    .catch((error) => setError(error.message));

                // Fetch played games
                fetch(`http://localhost:4000/user/${userId}/played`)
                    .then((response) => {
                        if (!response.ok) throw new Error('Failed to fetch played games');
                        return response.json();
                    })
                    .then((playedData) => {
                        const playedIDs = playedData.played_game_ids || [];
                        Promise.all(
                            playedIDs.map(id =>
                                fetch(`http://localhost:4000/api/games/${id}`).then(res => res.json())
                            )
                        ).then(games => setPlayedGames(games))
                         .catch(err => console.error("Error fetching played games:", err));
                    })
                    .catch((error) => setError(error.message));

                // Fetch rated games 🆕
                fetch(`http://localhost:4000/user/${userId}/ratings`)
                    .then((response) => {
                        if (!response.ok) throw new Error('Failed to fetch rated games');
                        return response.json();
                    })
                    .then((ratingData) => {
                        const ratings = ratingData.ratings || [];

                        Promise.all(
                            ratings.map(ratingEntry =>
                                fetch(`http://localhost:4000/api/games/${ratingEntry.game_id}`)
                                    .then(res => res.json())
                                    .then(game => ({ ...game, userRating: ratingEntry.rating })) // attach rating
                            )
                        ).then(games => setRatedGames(games))
                         .catch(err => console.error("Error fetching rated games:", err));
                    })
                    .catch((error) => setError(error.message));

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
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 space-y-6">
            {/* Profile Picture */}
            <img
                src={`http://localhost:4000/${userInfo.profile_pic}`}
                alt={"defaultProfilePic"}
                className="w-24 h-24 rounded-full object-cover shadow-md"
            />

            {/* Username */}
            <h1 className="text-4xl font-bold text-black">{userInfo.username}</h1>

            {/* Bio */}
            <p className="text-gray-600 text-center max-w-md">{userInfo.bio}</p>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
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

            {/* Favorite Games Section */}
            <div className="w-full max-w-4xl mt-10">
                <h2 className="text-2xl font-bold text-black mb-4">Favorite Games</h2>
                {favoriteGames.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {favoriteGames.map((game) => (
                            <Link to={`/games/${game.id}`} key={game.id}>
                                <div className="bg-gray-100 p-4 rounded-lg shadow hover:shadow-lg transition">
                                    <img
                                        src={game.cover?.url.replace('t_thumb', 't_cover_big') || '/default-game-cover.jpg'}
                                        alt={game.name}
                                        className="w-full h-40 object-cover rounded-md mb-2"
                                    />
                                    <h3 className="text-center font-semibold text-gray-800">{game.name}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">No favorite games yet!</p>
                )}
            </div>

            {/* Played Games Section */}
            <div className="w-full max-w-4xl mt-10">
                <h2 className="text-2xl font-bold text-black mb-4">Played Games</h2>
                {playedGames.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {playedGames.map((game) => (
                            <Link to={`/games/${game.id}`} key={game.id}>
                                <div className="bg-gray-100 p-4 rounded-lg shadow hover:shadow-lg transition">
                                    <img
                                        src={game.cover?.url.replace('t_thumb', 't_cover_big') || '/default-game-cover.jpg'}
                                        alt={game.name}
                                        className="w-full h-40 object-cover rounded-md mb-2"
                                    />
                                    <h3 className="text-center font-semibold text-gray-800">{game.name}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">No played games yet!</p>
                )}
            </div>

            {/* Rated Games Section 🆕 */}
            <div className="w-full max-w-4xl mt-10">
                <h2 className="text-2xl font-bold text-black mb-4">Rated Games</h2>
                {ratedGames.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {ratedGames.map((game) => (
                            <Link to={`/games/${game.id}`} key={game.id}>
                                <div className="bg-gray-100 p-4 rounded-lg shadow hover:shadow-lg transition flex flex-col items-center">
                                    <img
                                        src={game.cover?.url.replace('t_thumb', 't_cover_big') || '/default-game-cover.jpg'}
                                        alt={game.name}
                                        className="w-full h-40 object-cover rounded-md mb-2"
                                    />
                                    <h3 className="text-center font-semibold text-gray-800">{game.name}</h3>
                                    <p className="text-yellow-500 font-bold mt-2">{`Your Rating: ${game.userRating} / 5`}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">No rated games yet!</p>
                )}
            </div>
        </div>
    );
}
