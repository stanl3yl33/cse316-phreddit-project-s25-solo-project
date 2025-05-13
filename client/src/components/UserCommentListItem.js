import { insertLink } from "../utils/link-util";
import { useEffect, useState } from "react";
import axios from "axios";
import { usePhredditContext } from "./PhredditContext";
function UserCommentListItem({ comment }) {
  const { setMode, setEditCommentID } = usePhredditContext();
  const [postTitle, setPostTitle] = useState(null);
  useEffect(() => {
    async function fetchPostTitle() {
      try {
        const res = await axios.get(
          `http://localhost:8000/comments/post/title/${comment._id}`,
          { withCredentials: true }
        );
        setPostTitle(res.data || "Unknown");
      } catch (err) {
        console.error("something went wrong fetching the post title");
      }
    }
    fetchPostTitle();
  }, [comment._id, setPostTitle]);
  function handleClick() {
    console.log("editing page for commnet");
    setMode("editComment");
    setEditCommentID(comment._id);
  }
  return (
    <div className="user-profile-item" onClick={() => handleClick()}>
      <h3>Replied to - {postTitle}</h3>
      <h3 className="user-profile-item-comment-content">
        {insertLink(comment.content.slice(0, 20))}...
      </h3>
    </div>
  );
}

export default UserCommentListItem;
