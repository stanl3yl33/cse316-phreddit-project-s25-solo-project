import CommentListItem from "./CommentListItem";
import { useEffect, useState } from "react";
import axios from "axios";
function CommentListThread({ commentObj, indent, onShowMsg, onSetMsg }) {
  const [commentReplies, setCommentReplies] = useState([]);

  useEffect(
    function () {
      async function setup() {
        try {
          // get the comment reply obj based on current comment
          const res = await axios.get(
            `http://localhost:8000/comments/${commentObj._id}/replies`
          );
          const data = res.data;

          // sort the comments to be newest first:
          const sortReplies = data.sort(
            (a, b) => new Date(b.commentedDate) - new Date(a.commentedDate)
          );

          setCommentReplies(sortReplies);
        } catch (err) {
          console.error(
            "Something went wrong when fetching the replies for comments: ",
            err
          );
        }
      }

      setup();
    },
    [commentObj._id]
  );

  return (
    <>
      <CommentListItem
        commentObj={commentObj}
        indent={indent}
        onShowMsg={onShowMsg}
        onSetMsg={onSetMsg}
      />

      {commentReplies.map((reply) => (
        <CommentListThread
          key={reply._id}
          commentObj={reply}
          indent={indent + 1}
          onShowMsg={onShowMsg}
          onSetMsg={onSetMsg}
        />
      ))}
    </>
  );
}

export default CommentListThread;
