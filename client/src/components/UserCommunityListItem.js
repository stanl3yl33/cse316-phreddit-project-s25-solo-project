import { usePhredditContext } from "./PhredditContext";

function UserCommunityListItem({ community }) {
  const { setMode, setEditCommunityID } = usePhredditContext();

  function handleClick() {
    console.log("editing community");
    setMode("editCommunity");
    setEditCommunityID(community._id);
  }
  return (
    <div className="user-profile-item" onClick={() => handleClick()}>
      <h3>{community.name}</h3>
    </div>
  );
}

export default UserCommunityListItem;
