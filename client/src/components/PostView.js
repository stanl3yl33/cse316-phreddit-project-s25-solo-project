import { usePhredditContext } from "./PhredditContext";
import CommentList from "./CommentList";
import { timeStamp } from "../utils/time-util";
import { useEffect, useState } from "react";
import { insertLink } from "../utils/link-util";
import axios from "axios";
import MessageScreen from "./MessageScreen";

function PostView() {
  const { curPost, setMode, setReplyTo, communities, sessionUser } =
    usePhredditContext();
  const [curCommunity, setCurCommunity] = useState(null);
  const [flair, setFlair] = useState(null);
  const [commentCount, setCommentCount] = useState(0);
  const [displayName, setDisplayName] = useState("");

  //new vote related states:
  const [voteCount, setVoteCount] = useState(curPost.voteCount);
  // used for toggling btn style for vote
  const [userVote, setUserVote] = useState(() => {
    const existingVote = curPost.votes.find((v) => v.user === sessionUser?._id);
    return existingVote?.voteValue || 0; // 1, -1, or 0
  });

  const [activeVote, setActiveVote] = useState("");

  const [showMsg, setShowMsg] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (userVote === 1) {
      setActiveVote("up");
    } else if (userVote === -1) {
      setActiveVote("down");
    }
  }, [activeVote, userVote]);

  // get num of comments
  useEffect(() => {
    async function fetchCommentCount() {
      try {
        // comment route that gets all comments for a given post:
        const res = await axios.get(
          `http://localhost:8000/comments/post/${curPost._id}`
        );

        // res => array of comment objs
        const num = res.data.length;
        setCommentCount(num);
      } catch (err) {
        console.error("Error fetching comments from post:", err);
      }
    }

    fetchCommentCount();
  }, [curPost._id]);

  useEffect(() => {
    // useEffect func -> grabs the content of a linkFlair for display as well as set the replyTo context as well as curCommunity
    async function setup() {
      if (curPost.linkFlairID !== null) {
        const linkFlair = await axios.get(
          `http://localhost:8000/linkflairs/${curPost.linkFlairID}`
        );

        setFlair(linkFlair.data.content);
      }

      setReplyTo(curPost._id);

      //setting community context
      const match = communities.find((c) => c.postIDs.includes(curPost._id));
      if (match) {
        setCurCommunity(match);
      } else {
        console.warn("No community found for this post.");
      }
    }

    setup();
  }, [communities, curPost._id, setReplyTo, curPost.linkFlairID]);

  useEffect(() => {
    async function fetchDisplayName() {
      try {
        const res = await axios.get(`http://localhost:8000/users/`);
        const userList = res.data;
        const match = userList.find((user) => user._id === curPost.postedBy);

        setDisplayName(match.displayName);
      } catch (err) {
        console.log("Error fetching post flair: ", err);
      }
    }
    fetchDisplayName();
  }, [curPost.postedBy]);

  function handleAddComment() {
    setReplyTo(curPost._id);
    setMode("commentForm");
  }

  async function handleVote(val) {
    if (!sessionUser) return;

    if (sessionUser.reputation < 50) {
      // alert("You need at least 50 reputation to vote.");
      setShowMsg(true);
      setMsg("You need at least 50 reputation to vote on a post.");
      return;
    }

    try {
      const res = await axios.patch(
        `http://localhost:8000/posts/${curPost._id}/vote`,
        { val },
        { withCredentials: true }
      );
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
      {showMsg && (
        <MessageScreen msg={msg} onConfirm={() => setShowMsg(false)} />
      )}
      <div className="post-view">
        <div className="post-info">
          <p className="post-header">
            {curCommunity?.name ?? "Unknown"} | {timeStamp(curPost.postedDate)}
          </p>
          <p className="post-author">Posted By: {displayName}</p>
          <h1 className="title-post">{curPost.title}</h1>
          {curPost.linkFlairID && <p className="post-flair">{flair}</p>}
          <p className="post-content">{insertLink(curPost.content)}</p>
          <div className="post-stats">
            Views: {curPost.views} | Comments: {commentCount} | Votes:{" "}
            {voteCount}
          </div>

          {sessionUser && (
            <div className="vote-container">
              <button
                className={`vote-btn ${
                  activeVote === "up" ? "active-vote" : ""
                }`}
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
            <button className="add-comment" onClick={handleAddComment}>
              Add a comment
            </button>
          )}
        </div>

        <CommentList onShowMsg={setShowMsg} onSetMsg={setMsg} />
      </div>
    </>
  );
}

export default PostView;
