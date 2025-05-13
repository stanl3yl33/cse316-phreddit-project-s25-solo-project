import { usePhredditContext } from "./PhredditContext";

function CreatePostButton() {
  const { setMode, sessionUser } = usePhredditContext();

  function handleClick() {
    if (!sessionUser) return;

    console.log("loading create post form....");
    setMode("postForm");
  }
  return (
    <button
      className="create-post-btn"
      onClick={() => handleClick()}
      disabled={!sessionUser}
    >
      Create Post
    </button>
  );
}

export default CreatePostButton;
