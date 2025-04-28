import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom"; // 👈 import Link here
import './SearchResults.css';
import noPhoto from "../images/no_image.jpg";

const LoadingSpinner = () => (
  <div style={{ textAlign: "center", marginTop: "20px" }}>
    <div className="spinner"></div>
  </div>
);

const LoadingText = () => (
  <div className="loading-text">
    <p>Loading more games...</p>
  </div>
);

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchResults = () => {
  const queryParam = useQuery().get("query") || "";
  const [games, setGames] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const limit = 10;

  const fetchMoreGames = async () => {
    if (!queryParam) return;
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:4000/api/games/search?q=${encodeURIComponent(queryParam)}&limit=${limit}&offset=${page * limit}`);
      if (!res.ok) {
        throw new Error("Failed to fetch games");
      }
      const data = await res.json();

      if (data.length < limit) {
        setHasMore(false);
      }

      setGames((prev) => [...prev, ...data]);
    } catch (error) {
      console.error(error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setGames([]);
    setPage(0);
    setHasMore(true);
  }, [queryParam]);

  useEffect(() => {
    if (hasMore) {
      fetchMoreGames();
    }
  }, [page, hasMore, queryParam]);

  useEffect(() => {
    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 && !loading && hasMore) {
        setPage((prev) => prev + 1);
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [loading, hasMore]);

  return (
    <div> {/* Main wrapper div */}
      <div className="game-grid">
        {games.map((game, i) => (
          <Link key={i} to={`/games/${game.id}`} className="game-card-link"> {/* 👈 wrap each card in a Link */}
            <div className="game-card">
              <h2>{game.name}</h2>
              <img
                src={game.cover?.url
                  ? game.cover.url.replace("t_thumb", "t_cover_big")
                  : noPhoto}
                alt={game.name}
              />
              <p>
                {game.summary
                  ? game.summary.length > 150
                    ? game.summary.slice(0, 150) + '...'
                    : game.summary
                  : "No description available."}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {loading && <LoadingSpinner />}
      {loading && <LoadingText />}
      {!hasMore && games.length > 0 && (
        <p style={{ textAlign: "center", marginTop: "20px" }}>No more games to load.</p>
      )}
      {!loading && games.length === 0 && queryParam && (
        <p style={{ textAlign: "center", marginTop: "20px" }}>No games found for "{queryParam}".</p>
      )}
    </div>
  );
};

export default SearchResults;
