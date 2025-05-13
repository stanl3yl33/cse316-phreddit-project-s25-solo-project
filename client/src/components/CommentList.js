import CommentListThread from "./CommentListThread";
import { usePhredditContext } from "./PhredditContext";
import { useState, useEffect } from "react";
import axios from "axios";

function CommentList({ onShowMsg, onSetMsg }) {
  const { curPost } = usePhredditContext();
  const [comments, setComments] = useState([]);

  // need to fetch all the comment objs first:
  useEffect(
    function () {
      async function setup() {
        try {
          // gets all the top level replies and set the comments state as the res
          const res = await axios.get(
            `http://localhost:8000/posts/${curPost._id}/replies`
          );

          setComments(res.data);
        } catch (err) {
          console.error(
            "Error - something went wrong for fetching comments",
            err
          );
        }
      }
      setup();
    },
    [curPost._id]
  );

  // sort the comments from newest to oldest
  const postReplies = [...comments].sort(
    (a, b) => new Date(b.commentedDate) - new Date(a.commentedDate)
  );

  return (
    <div className="comments-list">
      {postReplies.map((comment) => (
        <CommentListThread
          key={comment._id}
          commentObj={comment}
          indent={1}
          onShowMsg={onShowMsg}
          onSetMsg={onSetMsg}
        />
      ))}
    </div>
  );
}

export default CommentList;
