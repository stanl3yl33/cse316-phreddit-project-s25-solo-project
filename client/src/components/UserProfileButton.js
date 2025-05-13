import { usePhredditContext } from "./PhredditContext";
function UserProfileButton() {
  const { sessionUser, setMode, setSelectedCommunity } = usePhredditContext();
  function handleClick() {
    if (!sessionUser) return;

    // should change mode to userProfile and take to user profile view
    setMode("userProfile");
    setSelectedCommunity(null);
  }

  return (
    <button
      className="create-post-btn"
      onClick={() => handleClick()}
      disabled={!sessionUser}
    >
      {!sessionUser ? "Guest" : `${sessionUser.displayName}`}
    </button>
  );
}

export default UserProfileButton;
