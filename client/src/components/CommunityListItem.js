import { usePhredditContext } from "./PhredditContext";
import axios from "axios";

function CommunityListItem({ community }) {
  const {
    setSelectedCommunity,
    selectedCommunity,
    setMode,
    setCurrentPostList,
  } = usePhredditContext();

  // console.log("community from props");
  // console.log(community);

  async function handleClick() {
    try {
      setSelectedCommunity(community._id); //default value is null
      setMode("community");

      // filter out curPostList for only list in related community
      // setCurrentPostList([...model.getCommunityPosts(community.communityID)]);

      // console.log(community.communityID);
      const postRes = await axios.get(
        `http://localhost:8000/communities/${community._id}/posts`
      );

      const sortedPosts = postRes.data.sort(
        (a, b) => new Date(b.postedDate) - new Date(a.postedDate)
      );

      // set postList context for displaying community related posts
      setCurrentPostList(sortedPosts);
    } catch (err) {
      console.error(
        "Something went wrong when fetching posts from community:",
        err
      );
    }
  }

  return (
    <li
      className={`community-item ${
        community._id === selectedCommunity ? "selected" : ""
      }`}
      onClick={() => handleClick()}
    >
      {/* for some reason, using 'a' tirggers a warning, switched to 'p' instead */}
      {/* <a>{community.name}</a> */}
      <p>{community.name}</p>
    </li>
  );
}

export default CommunityListItem;
