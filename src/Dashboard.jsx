import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ListOfPosts from "./ListOfPosts";
import FollowingList from "./FollowingList";
import FollowersList from "./FollowersList";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("https://instaserver-f4d3.onrender.com/uploads/default-profile.jpg");
  const [bio, setBio] = useState("");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [newPost, setNewPost] = useState({
    caption: "",
    image: null,
    preview: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [postError, setPostError] = useState(null);
  const navigate = useNavigate();

 useEffect(() => {
  const fetchUserData = async () => {
    try {
      const response = await fetch("https://instaserver-f4d3.onrender.com/api/dashboard", {
        credentials: "include",
      });

      console.log("Dashboard response status:", response.status);
      
      if (response.status === 401) {
        navigate("/instaFrontend/login");
        return;
      }

      const data = await response.json();
      console.log("Dashboard data:", data); // Add this to debug
      
      if (data.user) {
        setUser(data.user);
        setBio(data.user.bio || "");
        const imageUrl = data.user.profilePhoto
          ? `https://instaserver-f4d3.onrender.com${data.user.profilePhoto}`
          : "https://instaserver-f4d3.onrender.com/uploads/default-profile.jpg";
        setPreviewUrl(imageUrl);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      navigate("/instaFrontend/login");
    } finally {
      setIsLoading(false);
    }
  };

  fetchUserData();
}, [navigate]);

  const handleLogout = async () => {
    try {
      const response = await fetch("https://instaserver-f4d3.onrender.com/api/logout", {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      alert(data.message);
      navigate("/instaFrontend/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateProfilePhoto = async () => {
    if (!profilePhoto) return;

    const formData = new FormData();
    formData.append("profilePhoto", profilePhoto);

    try {
      setIsUploading(true);
      const response = await fetch(
        "https://instaserver-f4d3.onrender.com/api/users/updateProfilePic",
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const data = await response.json();
      if (data.profilePhotoUrl) {
        setUser((prev) => ({
          ...prev,
          profilePhoto: data.profilePhotoUrl,
        }));
        setPreviewUrl(`https://instaserver-f4d3.onrender.com${data.profilePhotoUrl}`);
        alert("Profile photo updated successfully!");
      }
    } catch (error) {
      console.error("Profile photo update failed:", error);
      alert("Failed to update profile photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleBioChange = (e) => {
    setBio(e.target.value);
  };

  const saveBio = async () => {
    try {
      const response = await fetch(
        "https://instaserver-f4d3.onrender.com/api/users/updateBio",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ bio }),
        }
      );

      const data = await response.json();
      if (data.user) {
        setUser(data.user);
        setIsEditingBio(false);
        alert("Bio updated successfully!");
      }
    } catch (error) {
      console.error("Failed to update bio:", error);
      alert("Failed to update bio");
    }
  };

  const handlePostImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setPostError("Only JPEG, PNG, or GIF images are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPostError("Image size must be less than 5MB");
      return;
    }

    setPostError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewPost({
        ...newPost,
        image: file,
        preview: reader.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const createPost = async () => {
    if (!newPost.image) {
      setPostError("Please select an image for your post");
      return;
    }

    const formData = new FormData();
    formData.append("image", newPost.image);
    formData.append("caption", newPost.caption);

    try {
      setIsUploading(true);
      setPostError(null);

      const response = await fetch("https://instaserver-f4d3.onrender.com/api/posts", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to create post");

      const data = await response.json();
      if (data.post) {
        alert("Post created successfully!");
        setNewPost({ caption: "", image: null, preview: "" });
        setActiveTab("posts");
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      setPostError(error.message || "Failed to create post.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return <div className="error-message">Failed to load user data</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>FlickerFrame</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      <div className="profile-section">
        <div className="profile-photo-container">
          <img
            src={previewUrl}
            alt="Profile"
            className="profile-photo"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://instaserver-f4d3.onrender.com/uploads/default-profile.jpg";
            }}
          />
          <div className="profile-photo-upload">
            <input
              type="file"
              id="profilePhoto"
              onChange={handleProfilePhotoChange}
              accept="image/*"
              style={{ display: "none" }}
            />
            <label htmlFor="profilePhoto" className="file-input-label">
              Change Photo
            </label>
            <button
              onClick={updateProfilePhoto}
              disabled={!profilePhoto || isUploading}
              className="upload-btn"
            >
              {isUploading ? "Uploading..." : "Save"}
            </button>
          </div>
        </div>

        <div className="profile-info">
          <h2>{user.username}</h2>
          <p>{user.email}</p>

          {isEditingBio ? (
            <div className="bio-edit-container">
              <textarea
                value={bio}
                onChange={handleBioChange}
                maxLength="150"
                className="bio-input"
              />
              <div className="bio-edit-actions">
                <button onClick={saveBio} className="save-bio-btn">Save</button>
                <button onClick={() => setIsEditingBio(false)} className="cancel-bio-btn">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="bio-display">
              <p>{bio || "No bio yet"}</p>
              <button onClick={() => setIsEditingBio(true)} className="edit-bio-btn">Edit Bio</button>
            </div>
          )}

          <div className="profile-stats">
            <div><span className="stat-count">{user.posts?.length || 0}</span><span className="stat-label">Posts</span></div>
            <div><span className="stat-count">{user.followers?.length || 0}</span><span className="stat-label">Followers</span></div>
            <div><span className="stat-count">{user.following?.length || 0}</span><span className="stat-label">Following</span></div>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${activeTab === "posts" ? "active" : ""}`} onClick={() => setActiveTab("posts")}>Posts</button>
        <button className={`tab-btn ${activeTab === "following" ? "active" : ""}`} onClick={() => setActiveTab("following")}>Following</button>
        <button className={`tab-btn ${activeTab === "followers" ? "active" : ""}`} onClick={() => setActiveTab("followers")}>Followers</button>
        <button className={`tab-btn ${activeTab === "new" ? "active" : ""}`} onClick={() => setActiveTab("new")}>New Post</button>
      </div>

      <div className="tab-content">
        {activeTab === "posts" && <ListOfPosts user={user} />}
        {activeTab === "following" && <FollowingList />}
        {activeTab === "followers" && <FollowersList />}
        {activeTab === "new" && (
          <div className="new-post-container">
            <input
              type="text"
              value={newPost.caption}
              onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
              placeholder="Write a caption..."
              className="caption-input"
            />
            <input type="file" accept="image/*" onChange={handlePostImageChange} />
            {newPost.preview && <img src={newPost.preview} alt="Preview" className="post-preview" />}
            {postError && <p className="error-text">{postError}</p>}
            <button onClick={createPost} disabled={isUploading}>
              {isUploading ? "Posting..." : "Post"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
