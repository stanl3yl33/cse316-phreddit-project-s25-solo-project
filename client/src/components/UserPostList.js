import UserPostListItem from "./UserPostListItem";
import { useState, useEffect } from "react";
import axios from "axios";

function UserPostList({ user }) {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPostsForUser(userId) {
      try {
        const res = await axios.get(
          `http://localhost:8000/posts/user/${userId}`,
          { withCredentials: true }
        );
        setPosts(res.data);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setError("Failed to fetch posts");
      }
    }

    if (user?._id) {
      fetchPostsForUser(user._id);
    }
  }, [user]);
  // console.log(posts);
  return (
    <div className="user-profile-list">
      <h1 className="user-profile-list-header">Posts</h1>
      {error && <p>{error}</p>}
      {posts.map((post) => (
        <UserPostListItem key={post._id} post={post} />
      ))}
    </div>
  );
}

export default UserPostList;
