import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ListOfPosts({ user }) {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likingPost, setLikingPost] = useState(null);
  const [followStatus, setFollowStatus] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("https://instaserver-f4d3.onrender.com/api/posts", {
          credentials: "include",
        });

        if (response.status === 401) {
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setPosts(data.posts || []);
        
        // Initialize follow status for each post's user
        const status = {};
        data.posts.forEach(post => {
          if (post.user && user) {
            status[post.user._id] = post.user.followers?.includes(user._id) || false;
          }
        });
        setFollowStatus(status);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError(err.message || "Failed to load posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [navigate, user]);

  const handleFollow = async (userId) => {
    try {
      const response = await fetch(
        `https://instaserver-f4d3.onrender.com/api/follow/${userId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();
      setFollowStatus(prev => ({
        ...prev,
        [userId]: data.isFollowing,
      }));
    } catch (err) {
      console.error("Follow action failed:", err);
    }
  };

  const handleLike = async (postId) => {
    try {
      setLikingPost(postId);
      const response = await fetch(
        `https://instaserver-f4d3.onrender.com/api/posts/${postId}/like`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to like post");
      }

      const data = await response.json();
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId ? data.post : post
        )
      );
    } catch (err) {
      console.error("Error liking post:", err);
      setError("Failed to like post. Please try again.");
    } finally {
      setLikingPost(null);
    }
  };

  const navigateToProfile = (userId) => {
    navigate(`/instaFrontend/profile/${userId}`);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="loading">Loading posts...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="posts-container">
      {posts.length === 0 ? (
        <div className="no-posts">
          <p>No posts available yet.</p>
        </div>
      ) : (
        posts.map((post) => (
          <div className="post-card" key={post._id}>
            <div className="post-header">
              <div 
                className="post-user-info"
                onClick={() => navigateToProfile(post.user?._id)}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={post.user?.profilePhoto 
                    ? `https://instaserver-f4d3.onrender.com${post.user.profilePhoto}` 
                    : 'https://instaserver-f4d3.onrender.com/uploads/default-profile.jpg'}
                  alt={post.user?.username || 'User'}
                  className="post-user-avatar"
                />
                <span className="post-username">{post.user?.username || 'Unknown User'}</span>
              </div>
              
              {post.user?._id && user?._id && post.user._id !== user._id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFollow(post.user._id);
                  }}
                  className={`follow-btn ${followStatus[post.user._id] ? 'following' : ''}`}
                >
                  {followStatus[post.user._id] ? 'Following' : 'Follow'}
                </button>
              )}
            </div>

            <div className="post-image-container">
              <img
                src={`https://instaserver-f4d3.onrender.com${post.imageUrl}`}
                alt="Post"
                className="post-image"
              />
            </div>

            <div className="post-actions">
              <button
                onClick={() => handleLike(post._id)}
                disabled={likingPost === post._id}
                className={`like-btn ${post.likes?.some(like => like._id === user?._id) ? 'liked' : ''}`}
              >
                {likingPost === post._id ? '...' : '❤️'} {post.likes?.length || 0}
              </button>
              <span className="post-date">{formatDate(post.createdAt)}</span>
            </div>

            <div className="post-caption">
              <strong>{post.user?.username || 'User'}</strong> {post.caption}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default ListOfPosts;
