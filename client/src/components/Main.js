import { usePhredditContext } from "./PhredditContext";
import CreateCommunityForm from "./CreateCommunityForm";
import PostListContent from "./PostListContent";
import CreatePostForm from "./CreatePostForm";
import PostView from "./PostView";
import CreateCommentForm from "./CreateCommentForm";
import UserProfile from "./UserProfile";
import EditCommentForm from "./EditCommentForm";
import EditCommunityForm from "./EditCommunityForm";
import EditPostForm from "./EditPostForm";

function Main() {
  const { mode } = usePhredditContext();
  return (
    <div id="main" className="main">
      {/* need to conditionally render this */}
      {(mode === "home" || mode === "community" || mode === "search") && (
        <PostListContent />
      )}

      {mode === "post" && <PostView />}

      {/* if mode === 'communityForm' Community form component goes here */}
      {mode === "communityForm" && <CreateCommunityForm />}

      {/* post form component goes here */}
      {mode === "postForm" && <CreatePostForm />}

      {/* create comment form goes here */}
      {/* if mode === "commentForm" */}
      {mode === "commentForm" && <CreateCommentForm />}

      {/* user profile view*/}
      {mode === "userProfile" && <UserProfile />}

      {/* Edit forms */}
      {mode === "editComment" && <EditCommentForm />}
      {mode === "editCommunity" && <EditCommunityForm />}
      {mode === "editPost" && <EditPostForm />}
    </div>
  );
}

export default Main;
