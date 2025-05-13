import { useEffect, useState } from "react";
import axios from "axios";
import UserCommentListItem from "./UserCommentListItem";
function UserCommentList({ user }) {
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCommentsForUser(userId) {
      try {
        const res = await axios.get(
          `http://localhost:8000/comments/user/${userId}`,
          { withCredentials: true }
        );
        setComments(res.data);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setError("Failed to fetch comments");
      }
    }
    fetchCommentsForUser(user._id);
  }, [user._id]);
  return (
    <div className="user-profile-list">
      <h1 className="user-profile-list-header">Comments</h1>
      {error && <p>{error}</p>}
      {comments.map((comment) => (
        <UserCommentListItem key={comment._id} comment={comment} />
      ))}
    </div>
  );
}

export default UserCommentList;
