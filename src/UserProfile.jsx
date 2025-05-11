import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingFollow, setProcessingFollow] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://instaserver-f4d3.onrender.com/api/users/${userId}`,
          {
            credentials: "include",
          }
        );

        if (response.status === 401) {
          if (isMounted) navigate("/login", { replace: true });
          return;
        }

        const data = await response.json();

        if (isMounted) {
          setProfile(data.user);
          setIsFollowing(data.isFollowing);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching profile:", err);
          setError("Failed to load user profile.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserProfile();

    return () => {
      isMounted = false;
    };
  }, [userId, navigate]);

  const handleFollowToggle = async () => {
    if (processingFollow) return;

    setProcessingFollow(true);
    try {
      const response = await fetch(
        `https://instaserver-f4d3.onrender.com/api/follow/${userId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();
      setIsFollowing(data.isFollowing);

      if (profile) {
        setProfile((prev) => ({
          ...prev,
          followers: data.isFollowing
            ? [...prev.followers, { _id: "current-user" }]
            : prev.followers.filter((f) => f._id !== "current-user"),
        }));
      }
    } catch (err) {
      console.error("Follow/unfollow failed:", err);
      setError("Follow action failed.");
    } finally {
      setProcessingFollow(false);
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!profile) return <div className="error">User not found</div>;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <img
          src={
            profile.profilePhoto
              ? `https://instaserver-f4d3.onrender.com${profile.profilePhoto}`
              : "https://cdn3.iconfinder.com/data/icons/it-and-ui-mixed-filled-outlines/48/default_image-1024.png"
          }
          alt="Profile"
          className="profile-photo"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://cdn3.iconfinder.com/data/icons/it-and-ui-mixed-filled-outlines/48/default_image-1024.png";
          }}
        />

        <div className="profile-info">
          <div className="profile-actions">
            <h2>{profile.username}</h2>
            <button
              onClick={handleFollowToggle}
              disabled={processingFollow}
              className={`follow-btn ${isFollowing ? "following" : ""}`}
            >
              {processingFollow ? "..." : isFollowing ? "Following" : "Follow"}
            </button>
          </div>

          <div className="profile-stats">
            <div>
              <span className="stat-count">{profile.posts?.length || 0}</span>
              <span className="stat-label">Posts</span>
            </div>
            <Link to={`/profile/${userId}/followers`}>
              <div>
                <span className="stat-count">
                  {profile.followers?.length || 0}
                </span>
                <span className="stat-label">Followers</span>
              </div>
            </Link>
            <Link to={`/profile/${userId}/following`}>
              <div>
                <span className="stat-count">
                  {profile.following?.length || 0}
                </span>
                <span className="stat-label">Following</span>
              </div>
            </Link>
          </div>

          <div className="profile-bio">
            <p>{profile.bio || "No bio yet"}</p>
          </div>
        </div>
      </div>

      <div className="profile-posts">
        <h3>Posts</h3>
        {profile.posts?.length === 0 ? (
          <p className="no-posts">No posts yet</p>
        ) : (
          <div className="posts-grid">
            {profile.posts.map((post) => (
              <div key={post._id} className="post-thumbnail">
                <img
                  src={`https://instaserver-f4d3.onrender.com${post.imageUrl}`}
                  alt="Post"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://cdn3.iconfinder.com/data/icons/it-and-ui-mixed-filled-outlines/48/default_image-1024.png";
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
