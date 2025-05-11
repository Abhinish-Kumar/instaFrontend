import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const FollowingList = () => {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const response = await fetch("https://instaserver-f4d3.onrender.com/api/following", {
          credentials: "include",
        });

        if (response.status === 401) {
          navigate("/login");
          return;
        }

        const data = await response.json();
        setFollowing(data.following || []);
      } catch (err) {
        console.error("Error fetching following:", err);
        setError("Failed to load following list");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowing();
  }, [navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading following...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="following-container">
      <h2>Following ({following.length})</h2>
      {following.length === 0 ? (
        <p className="no-following">You're not following anyone yet.</p>
      ) : (
        <ul className="user-list">
          {following.map((user) => (
            <li key={user._id} className="user-item">
              <img
                src={`https://instaserver-f4d3.onrender.com/${user.profilePhoto}`}
                alt={user.username}
                className="user-avatar"
                onError={(e) => {  e.target.onerror = null;
              e.target.src = "https://instaserver-f4d3.onrender.com/uploads/default-profile.jpg";
            }}
          />
          <div className="user-info">
            <h3>{user.username}</h3>
          </div>
        </li>
      ))}
    </ul>
  )}
</div>
);
};

export default FollowingList;