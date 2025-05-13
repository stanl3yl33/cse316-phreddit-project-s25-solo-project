function ToggleButtons({ onSelectList, user }) {
  return (
    <div className="toggle-btns">
      <button
        className="select-btn"
        id="select-community-btn"
        onClick={() => onSelectList("community")}
      >
        Communities
      </button>
      <button
        className="select-btn"
        id="select-post-btn"
        onClick={() => onSelectList("post")}
      >
        Posts
      </button>
      <button
        className="select-btn"
        id="select-comment-btn"
        onClick={() => onSelectList("comment")}
      >
        Comments
      </button>
      {user.isAdmin && (
        <button
          className="select-btn"
          id="select-user-btn"
          onClick={() => onSelectList("user")}
        >
          Users
        </button>
      )}
    </div>
  );
}

export default ToggleButtons;
