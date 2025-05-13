// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import "./stylesheets/App.css";
import { PhredditProvider } from "./components/PhredditContext.js";
import ParentPage from "./components/ParentPage.js";

import axios from "axios";
axios.defaults.withCredentials = true;

function App() {
  return (
    <PhredditProvider>
      <section className="phreddit">
        <ParentPage />
      </section>
    </PhredditProvider>
  );
}

export default App;
