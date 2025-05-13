import { useEffect, useState } from "react";
import axios from "axios";
import { usePhredditContext } from "./PhredditContext";
import UserCommunityListItem from "./UserCommunityListItem";

function UserCommunityList() {
  const { sessionUser } = usePhredditContext();
  const [communities, setCommunities] = useState([]);
  const [error, setError] = useState(null);
  useEffect(() => {
    async function fetchCommunities() {
      if (!sessionUser) return;

      try {
        const res = await axios.get(
          `http://localhost:8000/communities/user/${sessionUser._id}`,
          { withCredentials: true } // <== very important
        );
        setCommunities(res.data);
      } catch (err) {
        console.error("Failed to fetch communities:", err);
        setError("Failed to fetch posts");
      }
    }

    fetchCommunities();
  }, [sessionUser]);

  return (
    <div className="user-profile-list">
      <h1 className="user-profile-list-header">Communities</h1>
      {error && <p>{error}</p>}
      {communities.map((community) => (
        <UserCommunityListItem key={community._id} community={community} />
      ))}
    </div>
  );
}

export default UserCommunityList;
