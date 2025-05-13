import UserListItem from "./UserListItem";
import axios from "axios";
import { useState, useEffect } from "react";
import { usePhredditContext } from "./PhredditContext";
// filter out / exclude the session admin user from list
function UserList({ onUserList }) {
  const { sessionUser } = usePhredditContext();
  const [userList, setUserList] = useState([]);
  const [error, setError] = useState(false);
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await axios.get(`http://localhost:8000/users`, {
          withCredentials: true,
        });
        const filteredUsers = res.data.filter(
          (user) => user._id !== sessionUser._id
        );
        setUserList(filteredUsers);
        console.log("list of users:");
        console.log(filteredUsers);
      } catch (err) {
        console.error("Failed to users", err);
        setError("Failed to users");
      }
    }

    fetchUsers();
  }, [sessionUser._id]);
  return (
    <div className="user-profile-list-scroll-wrapper">
      <div className="user-profile-list">
        <h1 className="user-profile-list-header">Users</h1>
        {error && <p>{error}</p>}
        {userList.map((user) => (
          <UserListItem
            key={user._id}
            user={user}
            onSetUserList={setUserList}
          />
        ))}
      </div>
    </div>
  );
}

export default UserList;
