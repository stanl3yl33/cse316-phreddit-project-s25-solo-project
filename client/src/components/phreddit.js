// import Model from "../models/model.js";
import Header from "./Header.js";
import Main from "./Main.js";
import NavBar from "./NavBar.js";
// component for main layout
// use context to surround the App.js comp itself
export default function Phreddit() {
  return (
    <div className="container">
      <Header />
      <NavBar />
      <Main />
    </div>
  );
}
