import { usePhredditContext } from "./PhredditContext";
function UserPostListItem({ post }) {
  const { setMode, setEditPostID } = usePhredditContext();

  function handleClick() {
    console.log("edit pg for Users");
    setEditPostID(post._id);
    setMode("editPost");
  }
  return (
    <div className="user-profile-item" onClick={() => handleClick()}>
      <h3>{post.title}</h3>
    </div>
  );
}

export default UserPostListItem;
