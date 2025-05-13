import PostList from "./PostList";
import PostListBanner from "./PostListBanner";

function PostListContent() {
  return (
    <div className="main-content">
      {/* Home / Community / Search View */}
      <PostListBanner />

      {/* Post List Content */}
      <PostList />
    </div>
  );
}

export default PostListContent;
