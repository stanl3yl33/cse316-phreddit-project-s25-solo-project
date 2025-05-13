import { useState } from "react";
import { usePhredditContext } from "./PhredditContext";
import axios from "axios";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  // triggered on unsuccessful login
  // Msg === 'wrong email and/or password'
  const [err, setErr] = useState(false);
  const { setPage, setSessionUser } = usePhredditContext(); // set to phreddit on success

  async function handleSubmit(e) {
    e.preventDefault();
    setErr(false); // Reset error state first

    try {
      const res = await axios.post("http://localhost:8000/authenticate/login", {
        emailInput: email,
        pwInput: pw,
      });

      // If login is successful, go to main page
      if (res.status === 200) {
        //set session to contain user:
        // user includes:
        // _id of current user
        // displayName
        // email
        // their reputation
        // if they are an admin or not
        setSessionUser(res.data.user);
        setPage("phreddit");
      }
    } catch (err) {
      // If backend returns 401, show error to user but suppress logging to console
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 400)
      ) {
        setErr(true); // Triggers "Wrong email and/or password" message
      } else {
        // Only log if it's an unexpected error
        console.error("Unexpected login error:", err);
      }
    }
  }

  return (
    <div>
      <form className="create-post-form">
        <h1>Login</h1>
        <div className="input-group">
          <label htmlFor="login-email-input">Email</label>
          <input
            id="login-email-input"
            name="login-email-input"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErr(false);
            }}
          ></input>
        </div>
        <div className="input-group">
          <label htmlFor="login-pw-input">Password</label>
          <input
            id="login-pw-input"
            name="login-pw-input"
            placeholder="Enter password"
            value={pw}
            onChange={(e) => {
              setPw(e.target.value);
              setErr(false);
            }}
          ></input>
        </div>

        {/* error msg (used for both (essentially only 1 error msg)) */}
        {err && (
          <p className="error-msg">
            Wrong email and/or password provided. Try again.
          </p>
        )}
        <button className="btn-submit" onClick={(e) => handleSubmit(e)}>
          Submit
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
