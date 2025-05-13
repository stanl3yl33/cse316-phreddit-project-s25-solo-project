import { usePhredditContext } from "./PhredditContext";

function HomeButton() {
  const { resetState, mode } = usePhredditContext();
  return (
    <li className={`home ${mode === "home" ? "home-active" : ""}`}>
      {/* <a className="link-home">Home</a> */}
      {/* <button className="link-home">Home</button> */}
      <div className={`link-home`} onClick={() => resetState()}>
        Home
      </div>
    </li>
  );
}

export default HomeButton;
