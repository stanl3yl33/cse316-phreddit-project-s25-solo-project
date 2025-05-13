import { usePhredditContext } from "./PhredditContext";
import { timeStamp } from "../utils/time-util";
import { useState, useEffect } from "react";
import { insertLink } from "../utils/link-util";
import axios from "axios";

function PostListItem({ post }) {
  const { setCurPost, setReplyTo, setMode, communities, setCurrentPostList } =
    usePhredditContext();

  const [postView, setPostView] = useState(post.views);
  const [commentCount, setCommentCount] = useState(0);
  const [voteCount, setVoteCount] = useState(0);
  const [flair, setFlair] = useState(null);
  const [displayName, setDisplayName] = useState("");

  const community = communities.find((c) => c.postIDs.includes(post._id));

  // console.log(post.postedDate);
  const handleClick = async () => {
    try {
      // on get request, the post gets auto incremented by one
      const res = await axios.get(`http://localhost:8000/posts/${post._id}`);
      setPostView(res.data.views);
      setCurPost(res.data);
      setReplyTo(post._id);
      setMode("post");

      // need to sync up context postList to reflect the newly incremented view:
      setCurrentPostList((prev) =>
        prev.map((post) => (post._id === res.data._id ? res.data : post))
      );
    } catch (err) {
      console.error("Error on click handler for post list item:", err);
    }
  };

  // get num of comments
  useEffect(() => {
    async function fetchVoteCountCommentCount() {
      try {
        // comment route that gets all comments for a given post:
        const res = await axios.get(
          `http://localhost:8000/comments/post/${post._id}`
        );

        // res => array of comment objs
        const num = res.data.length;
        setCommentCount(num);
        setVoteCount(post.voteCount);
      } catch (err) {
        console.error("Error fetching comments from post:", err);
      }
    }

    fetchVoteCountCommentCount();
  }, [post._id, post.voteCount]);

  // get flair for post list
  useEffect(() => {
    async function fetchPostFlair() {
      try {
        if (post.linkFlairID !== null) {
          //fetch flair
          const res = await axios.get(
            `http://localhost:8000/linkflairs/${post.linkFlairID}`
          );
          setFlair(res.data);
        }
      } catch (err) {
        console.log("Error fetching post flair: ", err);
      }
    }
    fetchPostFlair();
  }, [post.linkFlairID]);

  // get display name of post:
  useEffect(() => {
    async function fetchDisplayName() {
      try {
        const res = await axios.get(`http://localhost:8000/users/`);
        const userList = res.data;
        const match = userList.find((user) => user._id === post.postedBy);

        setDisplayName(match.displayName);
      } catch (err) {
        console.log("Error fetching post flair: ", err);
      }
    }
    fetchDisplayName();
  }, [post.postedBy]);

  return (
    <div className="post" onClick={() => handleClick()}>
      <p>
        {community?.name ?? "Unknown Community"} &middot; {displayName} &middot;
        {timeStamp(post.postedDate)}
      </p>
      <h2 className="post-title">{post.title}</h2>
      {flair && <p className="link-flair">{flair.content}</p>}

      <p>{insertLink(post.content.slice(0, 80))}...</p>
      <span className="stats">
        <p>{postView} Views</p>
        <p>{commentCount} Comments</p>
        {/* need to add vote count here */}
        <p>{voteCount} Votes</p>
      </span>
    </div>
  );
}

export default PostListItem;
