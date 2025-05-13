import { usePhredditContext } from "./PhredditContext";
import PostListItem from "./PostListItem";

function PostList() {
  const { currentPostList } = usePhredditContext();

  return (
    <div className="posts-container">
      {/* {currentPostList.length === 0
        ? ""
        : currentPostList.map((post) => (
            <PostListItem key={post._id} post={post} />
          ))} */}
      {currentPostList.map((post) => (
        <PostListItem key={post._id} post={post} />
      ))}
    </div>
  );
}

export default PostList;
