import CommunityList from "./CommunityList";
import CreateCommunityButton from "./CreateCommunityButton";
import HomeButton from "./HomeButton";

// need to add the blue text implementation (sort of did #3 for now)
function NavBar() {
  return (
    <nav className="nav-bar">
      <ul className="nav-bar-inner">
        <HomeButton />
        <hr />
        <li className="communities-nav-container">
          <h2 className="communities-header">Communities</h2>

          <div className="communities-content">
            <CreateCommunityButton />

            {/* community list component goes here: */}
            <CommunityList />
          </div>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;
