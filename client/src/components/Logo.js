import { usePhredditContext } from "./PhredditContext";

function Logo() {
  const { resetState, sessionUser, setPage } = usePhredditContext();

  function handleClick() {
    // if no sessionUser, i.e. no session, it should take u back to welcome page
    if (!sessionUser) {
      setPage("welcome");
      resetState();
      return;
    }

    // according to piazza post, if there is a logged in user, it should just take you to home view instead
    resetState();
  }
  return (
    <span className="logo" onClick={() => handleClick()}>
      phreddit
    </span>
  );
}

export default Logo;
