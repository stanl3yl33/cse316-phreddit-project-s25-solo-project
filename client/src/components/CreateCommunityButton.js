import { usePhredditContext } from "./PhredditContext";
function CreateCommunityButton() {
  const { setMode, mode, sessionUser } = usePhredditContext();
  return (
    <div className="create-community-wrapper">
      <button
        className={`btn-create-community ${
          mode === "communityForm" ? "active" : ""
        }`}
        onClick={() => setMode("communityForm")}
        disabled={!sessionUser}
      >
        Create Community
      </button>
    </div>
  );
}

export default CreateCommunityButton;
