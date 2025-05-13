import { usePhredditContext } from "./PhredditContext";
import axios from "axios";

function LogoutButton() {
  const { setPage, setSessionUser, setMode, resetState } = usePhredditContext();

  async function handleLogout() {
    try {
      // make request to logout current session user (i.e. delete current session from database and update session context)
      await axios.post("http://localhost:8000/authenticate/logout", null, {
        withCredentials: true,
      });

      setSessionUser(null);

      //reset state:
      resetState();

      // go back to welcome page:
      setPage("welcome");

      // reset main view back to home to avoid errors (i.e. if user is viewing user prof when loggin out -> guest view = error)
      setMode("home");
    } catch (err) {
      console.error("logout failed: ", err);
    }
  }
  return (
    // must conditionall render the logout button based on if session is there
    <button
      onClick={() => {
        handleLogout();
      }}
      className="create-post-btn"
    >
      Log out
    </button>
  );
}

export default LogoutButton;
