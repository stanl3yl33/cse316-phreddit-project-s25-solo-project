// show displayName, email, and reputation
import { usePhredditContext } from "./PhredditContext";
import { useState, useEffect } from "react";
import axios from "axios";
import ConfirmScreen from "./ConfirmScreen";
function UserListItem({ user, onSetUserList }) {
  // change the user for user profile:
  const { setViewedUser, setCurrentPostList, setCommunities, sessionUser } =
    usePhredditContext();

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleClick() {
    console.log("toggle  user");
    setViewedUser(user);
  }

  function handleShowConfirm() {
    setShowConfirm(true);
  }

  useEffect(() => {
    if (!confirmDelete) return;

    async function deleteUser() {
      try {
        console.log(user._id);
        // delete user request:
        await axios.delete(`http://localhost:8000/users/${user._id}/delete`, {
          withCredentials: true,
        });

        // update the user list for user profile to be up to date:
        const res = await axios.get(`http://localhost:8000/users`, {
          withCredentials: true,
        });
        const filteredUsers = res.data.filter(
          (user) => user._id !== sessionUser._id
        );
        onSetUserList(filteredUsers);

        // update post list and communities if deleting user resulted in deleting their list respectively:
        const postRes = await axios.get(`http://localhost:8000/posts/`);
        setCurrentPostList(postRes.data);

        const communityRes = await axios.get(
          `http://localhost:8000/communities/`
        );
        setCommunities(communityRes.data);
        setShowConfirm(false);
      } catch (err) {
        console.error(`Error when deleting user ${user.displayName}`);
        setShowConfirm(false);
      }
    }
    deleteUser();
  }, [
    confirmDelete,
    onSetUserList,
    sessionUser._id,
    setCommunities,
    setCurrentPostList,
    user._id,
    user.displayName,
  ]);

  return (
    <div className="user-profile-item-container">
      <div className="user-profile-item" onClick={() => handleClick()}>
        <div>
          <h3>DisplayName: {user.displayName}</h3>
          <h3>Email: {user.email}</h3>
          <h3>Reputation: {user.reputation}</h3>
        </div>
      </div>

      <button className="btn-delete" onClick={() => handleShowConfirm()}>
        Delete
      </button>
      {showConfirm && (
        <ConfirmScreen
          msg={`Are you sure you want to delete user '${user.displayName}'`}
          onConfirm={() => setConfirmDelete(true)}
          onDeny={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}

export default UserListItem;
