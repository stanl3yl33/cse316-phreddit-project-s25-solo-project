import CommunityListItem from "./CommunityListItem";
import { usePhredditContext } from "./PhredditContext";

function CommunityList() {
  // use the global community context state to dynamically generate the list
  const { communities } = usePhredditContext();
  // console.log(communities);
  // console.log("community-list component here:");
  // console.log(communities);

  return (
    <ul className="community-list">
      {/* <!-- community-item <li><a></a></li> --> */}
      {communities.map((community) => (
        <CommunityListItem key={community._id} community={community} />
      ))}
    </ul>
  );
}

export default CommunityList;
