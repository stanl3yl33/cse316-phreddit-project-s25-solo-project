import { usePhredditContext } from "./PhredditContext";
import WelcomePage from "./WelcomePage";
import Phreddit from "./phreddit";
import RegisterPage from "./RegisterPage";
import LoginPage from "./LoginPage";

function ParentPage() {
  const { page } = usePhredditContext();

  return (
    <>
      {page === "welcome" && <WelcomePage />}
      {page === "register" && <RegisterPage />}
      {page === "login" && <LoginPage />}
      {page === "phreddit" && <Phreddit />}
    </>
  );
}

export default ParentPage;
