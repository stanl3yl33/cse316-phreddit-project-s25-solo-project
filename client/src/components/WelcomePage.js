import { usePhredditContext } from "./PhredditContext";

function WelcomePage() {
  const { setPage } = usePhredditContext();

  return (
    <>
      <div className="welcome-pg-container">
        <div className="welcome-pg-border">
          <h1 className="welcome-logo">Phreddit</h1>
          {/* button component: */}
          <div className="select-btns">
            <button
              className="welcome-btn"
              id="register-btn"
              onClick={() => setPage("register")}
            >
              Register
            </button>

            <button
              className="welcome-btn"
              id="login-btn"
              onClick={() => setPage("login")}
            >
              Login
            </button>

            {/* go straight into page without setting up session */}
            <button
              className="welcome-btn"
              id="guest-btn"
              onClick={() => setPage("phreddit")}
            >
              Continue as guest
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default WelcomePage;
