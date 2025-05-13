import CreatePostButton from "./CreatePostButton";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import UserProfileButton from "./UserProfileButton";
import LogoutButton from "./LogoutButton";
import { usePhredditContext } from "./PhredditContext";
// should contain the search bar component:
function Header() {
  const { sessionUser } = usePhredditContext();

  return (
    <div id="header" className="header">
      <Logo />
      <div className="header-center">
        <SearchBar />
      </div>

      <div className="header-button-group">
        <CreatePostButton />
        <UserProfileButton />
        {sessionUser && <LogoutButton />}
      </div>
    </div>
  );
}

export default Header;
