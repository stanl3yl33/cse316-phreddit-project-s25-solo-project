import { usePhredditContext } from "./PhredditContext";
import { timeStamp } from "../utils/time-util";
import { useState, useEffect } from "react";
import UserCommunityList from "./UserCommunityList";
import UserCommentList from "./UserCommentList";
import UserList from "./UserList";
import UserPostList from "./UserPostList";
import ToggleButtons from "./ToggleButtons";

// admin sees user list first by default, regular users see posts by default
function UserProfile() {
  // Need to display:
  //  1. display name
  //  2. email address
  //  3. member since timestamp
  //  4. reputation of user, with appropriate labels

  // after wards lists of communities, posts, or comments made by user which should be toggled via 3 buttons
  // listing allows them to delete and edit existing listings they made

  // admin gets additional list of users
  // additionally,
  const { viewedUser, sessionUser, setViewedUser } = usePhredditContext();

  const [selectList, setSelectList] = useState(
    // sessionUser.isAdmin && viewedUser === sessionUser ? "user" : "post"
    sessionUser.isAdmin ? "user" : "post"
  );
  const [user, setUser] = useState(viewedUser || sessionUser);

  useEffect(() => {
    if (viewedUser && viewedUser._id !== user._id) {
      setUser(viewedUser);
      setSelectList("post");
    }
  }, [viewedUser, user._id]);

  function handleBack() {
    setUser(sessionUser);
    setSelectList("user");
    setViewedUser(sessionUser);
  }

  return (
    <div className="user-profile-outer">
      {/* way back */}
      {sessionUser.isAdmin && user._id !== sessionUser._id && (
        <button className="back-btn" onClick={() => handleBack()}>
          &#8592; Back
        </button>
      )}
      <div className="user-desc">
        <h1 className="user-desc-header">User Profile</h1>
        <h3 className="user-desc-display-Name">
          Display Name: {user.displayName}
        </h3>
        <h3 className="user-desc-email">Email: {user.email}</h3>
        <h3 className="user-desc-created-date">
          Member since: {timeStamp(new Date(user.creationDate))}
        </h3>

        <h3 className="user-desc-rep">Reputation: {user.reputation}</h3>
      </div>

      <ToggleButtons onSelectList={setSelectList} user={user} />

      <div className="profile-scroll-wrapper">
        <div className="profile-lists">
          {selectList === "post" && <UserPostList user={user} />}
          {selectList === "community" && <UserCommunityList user={user} />}
          {selectList === "comment" && <UserCommentList user={user} />}
          {selectList === "user" && <UserList />}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
