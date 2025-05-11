import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const FollowersList = () => {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const response = await fetch("https://instaserver-f4d3.onrender.com/api/followers", {
          credentials: "include",
        });

        if (response.status === 401) {
          navigate("/login");
          return;
        }

        const data = await response.json();
        setFollowers(data.followers || []);
      } catch (err) {
        console.error("Error fetching followers:", err);
        setError("Failed to load followers list");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading followers...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="followers-container">
      <h2>Followers ({followers.length})</h2>
      {followers.length === 0 ? (
        <p className="no-followers">You don't have any followers yet.</p>
      ) : (
        <ul className="user-list">
          {followers.map((user) => (
            <li key={user._id} className="user-item">
              <img
                src={`http://localhost:4000${user.profilePhoto}`}
                alt={user.username}
                className="user-avatar"
                onError={(e) => {
                  e.target.onerror = null;
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

export default FollowersList;