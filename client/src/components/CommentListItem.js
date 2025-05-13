import { usePhredditContext } from "./PhredditContext";
import { timeStamp } from "../utils/time-util";
import { insertLink } from "../utils/link-util";
import { useState, useEffect } from "react";
import axios from "axios";

function CommentListItem({ commentObj, indent, onShowMsg, onSetMsg }) {
  const { setMode, setReplyTo, sessionUser } = usePhredditContext();

  //only possible values are -1, 1, or 0
  const [userVote, setUserVote] = useState(() => {
    const existingVote = commentObj.votes.find(
      (v) => v.user === sessionUser?._id
    );
    return existingVote?.voteValue || 0;
  });
  const [activeVote, setActiveVote] = useState("");
  const [voteCount, setVoteCount] = useState(commentObj.voteCount);
  const [displayName, setDisplayName] = useState("");

  function handleAddComment() {
    setReplyTo(commentObj._id);
    setMode("commentForm");
  }

  useEffect(() => {
    async function fetchDisplayName() {
      try {
        const res = await axios.get(`http://localhost:8000/users/`);
        const userList = res.data;
        const match = userList.find(
          (user) => user._id === commentObj.commentedBy
        );

        setDisplayName(match.displayName);
      } catch (err) {
        console.log("Error fetching post flair: ", err);
      }
    }
    fetchDisplayName();
  }, [commentObj.commentedBy]);

  useEffect(() => {
    if (userVote === 1) {
      setActiveVote("up");
    } else if (userVote === -1) {
      setActiveVote("down");
    } else {
      setActiveVote("");
    }
  }, [activeVote, userVote]);

  async function handleVote(val) {
    if (sessionUser.reputation < 50) {
      onShowMsg(true);
      onSetMsg("You must have at least a reputation 50 to vote on a comment.");
      return;
    }

    try {
      const res = await axios.patch(
        `http://localhost:8000/comments/${commentObj._id}/vote`,
        { val },
        { withCredentials: true }
      );
      //update vote count
      setVoteCount(res.data.voteCount);

      // toggle or switch vote
      if (userVote === val) {
        // sets the vote back to zero
        setUserVote(0);
        setActiveVote("");
      } else {
        // update vote value to appropriate value
        setUserVote(val);
      }
    } catch (err) {
      console.error("Failed to vote:", err);
    }
  }

  return (
    <>
      <div className="comment" style={{ marginLeft: `${indent * 16}px` }}>
        <p className="comment-stats">
          {displayName} | {timeStamp(commentObj.commentedDate)}
        </p>
        <p className="comment-content">{insertLink(commentObj.content)}</p>
        <p>Votes: {voteCount}</p>
        {sessionUser && (
          <div className="vote-container">
            <button
              className={`vote-btn ${activeVote === "up" ? "active-vote" : ""}`}
              onClick={() => handleVote(1)}
            >
              &uarr; upvote
            </button>
            <button
              className={`vote-btn ${
                activeVote === "down" ? "active-vote" : ""
              }`}
              onClick={() => handleVote(-1)}
            >
              &darr; downvote
            </button>
          </div>
        )}
        {sessionUser && (
          <button className="reply-button" onClick={() => handleAddComment()}>
            Reply
          </button>
        )}
      </div>
    </>
  );
}

export default CommentListItem;
