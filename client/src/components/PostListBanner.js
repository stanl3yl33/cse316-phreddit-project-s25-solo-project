import SortingButtons from "./SortingButtons";
import { usePhredditContext } from "./PhredditContext";
import { timeStamp } from "../utils/time-util";
import { insertLink } from "../utils/link-util";
import { useState, useEffect } from "react";
import axios from "axios";

function PostListBanner() {
  const {
    mode,
    selectedCommunity,
    currentPostList,
    searchQuery,
    communities,
    sessionUser,
    setCommunities,
  } = usePhredditContext(); // null by default

  const [creator, setCreator] = useState("");
  // const [memberCount, setMemberCount] = useState(0);
  const [isMember, setIsMember] = useState(false);

  const community = selectedCommunity
    ? communities.find((c) => c._id === selectedCommunity)
    : null;

  useEffect(() => {
    async function setup() {
      if (selectedCommunity !== null) {
        // First get community details
        const res = await axios.get(
          `http://localhost:8000/communities/${selectedCommunity}`
        );

        // creator is stored as uid in db
        const creatorId = res.data.creator;

        // Fetch the creator displayName
        const userRes = await axios.get(
          `http://localhost:8000/users/${creatorId}`
        );
        setCreator(userRes.data.displayName);

        // check if current session user is part of community or not:
        if (sessionUser && res.data.members.includes(sessionUser._id)) {
          setIsMember(true);
        } else {
          setIsMember(false);
        }
      }
    }

    setup();
  }, [selectedCommunity, sessionUser]);

  async function handleJoin() {
    try {
      const res = await axios.patch(
        `http://localhost:8000/communities/${community._id}/join`,
        {},
        { withCredentials: true }
      );

      // Refresh all communities from backend
      const updated = await axios.get("http://localhost:8000/communities", {
        withCredentials: true,
      });

      const allCommunities = updated.data;

      if (sessionUser) {
        const memberCommunities = allCommunities.filter((c) =>
          c.members.includes(sessionUser._id)
        );
        const nonMemberCommunities = allCommunities.filter(
          (c) => !c.members.includes(sessionUser._id)
        );
        setCommunities([...memberCommunities, ...nonMemberCommunities]);
      } else {
        setCommunities(allCommunities);
      }

      setIsMember(true);
    } catch (err) {
      console.error("Join failed:", err);
    }
  }

  async function handleLeave() {
    try {
      const res = await axios.patch(
        `http://localhost:8000/communities/${community._id}/leave`,
        {},
        { withCredentials: true }
      );

      // Refresh all communities from backend
      const updated = await axios.get("http://localhost:8000/communities", {
        withCredentials: true,
      });
      const allCommunities = updated.data;

      if (sessionUser) {
        const memberCommunities = allCommunities.filter((c) =>
          c.members.includes(sessionUser._id)
        );
        const nonMemberCommunities = allCommunities.filter(
          (c) => !c.members.includes(sessionUser._id)
        );
        setCommunities([...memberCommunities, ...nonMemberCommunities]);
      } else {
        setCommunities(allCommunities);
      }

      setIsMember(false);
    } catch (err) {
      console.error("Leave failed:", err);
    }
  }

  return (
    <div className="banner">
      {/* Banner Header (changes with view mode) */}
      {selectedCommunity !== null ? (
        <h1 className="banner-header">{community?.name}</h1>
      ) : mode === "home" ? (
        <h1 className="banner-header">All Posts</h1>
      ) : (
        <h1 className="banner-header">
          {currentPostList.length === 0
            ? `No Results Found For: ${searchQuery}`
            : `Results for: ${searchQuery}`}
        </h1>
      )}

      {/* Community Info (conditionally visible) */}
      {selectedCommunity !== null && (
        <div className="community-info">
          {/* <p className="desc-community">{community.description}</p> */}
          <p className="desc-community">{insertLink(community?.description)}</p>
          <p className="creation-date-community">
            Created by {creator} | {timeStamp(community.startDate)}
          </p>
          <p>
            {community.postIDs.length > 1
              ? `${community.postIDs.length} posts`
              : `${community.postIDs.length} post`}
            &middot; {community.members.length} members
          </p>
        </div>
      )}

      {/* Post Count */}
      <div className="num-post">
        <p>{currentPostList.length} posts</p>

        {selectedCommunity &&
          sessionUser &&
          (isMember ? (
            <button className="join-leave-btn" onClick={() => handleLeave()}>
              Leave
            </button>
          ) : (
            <button className="join-leave-btn" onClick={() => handleJoin()}>
              Join
            </button>
          ))}
      </div>

      {/* Sorting Buttons */}
      <SortingButtons />
    </div>
  );
}

export default PostListBanner;
