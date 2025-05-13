// After completion with no errors -> take us back to the welcome page:
import { useState } from "react";
import { usePhredditContext } from "./PhredditContext";
import axios from "axios";

function RegisterPage() {
  // display name must be unique
  // email must be unique
  // email must be valid form : abc@fjadskl;fj;dsla.sfasfda
  // plaintext password SHOULD NOT INCLUDE:
  //    1. first name
  //    1. last name
  //    1. display name
  //    1. email id -> i.e. email field itself

  // 1. first name
  const [firstName, setFirstName] = useState("");
  const [firstNameError, setFirstNameError] = useState(false);

  // 2. last name
  const [lastName, setLastName] = useState("");
  const [lastNameError, setLastNameError] = useState(false);

  // 3. display name
  const [displayName, setDisplayName] = useState("");
  const [displayNameError, setDisplayNameError] = useState(false);

  // 4. password
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);

  // 5. password confirmation
  const [confirmPw, setConfirmPw] = useState("");

  // 6. email
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [emailDup, setEmailDup] = useState(false);

  const { setPage } = usePhredditContext();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  async function handleSubmit(e) {
    e.preventDefault();
    let error = false;

    // reset error
    setDisplayNameError(false);
    setFirstNameError(false);
    setLastNameError(false);
    setPwError(false);
    setEmailError(false);
    setEmailDup(false);

    // check firstName and lastName field for empty field:
    if (firstName.trim().length === 0) {
      error = true;
      setFirstNameError(true);
    }

    if (lastName.trim().length === 0) {
      error = true;
      setLastNameError(true);
    }

    // check displayName for empty + uniqueness:
    if (displayName.trim().length === 0) {
      error = true;
      setDisplayNameError(true);
    } else {
      try {
        const res = await axios.post(
          "http://localhost:8000/users/check-duplicate-name",
          {
            displayName: displayName.trim(),
          }
        );

        if (res.data.status === "duplicate") {
          error = true;
          setDisplayNameError(true);
        }
      } catch (err) {
        error = true;
        setDisplayNameError(true);
      }
    }

    // check email for empty -> valid form -> uniqueness:
    if (email.trim().length === 0) {
      error = true;
      setEmailError(true);
    } else if (emailRegex.test(email) === false) {
      error = true;
      setEmailError(true);
    } else {
      try {
        const res = await axios.post(
          "http://localhost:8000/users/check-duplicate-email",
          {
            email: email.trim(),
          }
        );

        if (res.data.status === "duplicate") {
          error = true;
          setEmailError(true);
          setEmailDup(true);
        }
      } catch (err) {
        error = true;
        setEmailError(true);
      }
    }

    // password check:
    const includesSensitiveInfo =
      pw.includes(firstName) ||
      pw.includes(lastName) ||
      pw.includes(displayName) ||
      pw.includes(email);

    if (pw.trim().length === 0 || includesSensitiveInfo || pw !== confirmPw) {
      error = true;
      setPwError(true);
    }

    // if no errors submit post request to make new user account
    if (!error) {
      const payload = {
        firstName,
        lastName,
        displayName,
        email,
        password: pw,
      };

      try {
        await axios.post("http://localhost:8000/users/register", payload);
        setPage("welcome");
      } catch (err) {
        console.error("Error - Registration failure: ", err);
      }
    }
  }

  return (
    <div>
      <form className="create-post-form">
        <h1>User Registration</h1>

        {/* first name input field */}
        <div className="input-group">
          <label htmlFor="reg-first-name-input">First Name *</label>
          <input
            id="reg-first-name-input"
            name="reg-first-name-input"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              setFirstNameError(false);
            }}
          ></input>
          {firstNameError && (
            <p className="error-msg" id="reg-first-name-error">
              First name field cannot be empty
            </p>
          )}
        </div>

        {/* last name input field */}
        <div className="input-group">
          <label htmlFor="reg-last-name-input">Last Name *</label>
          <input
            id="reg-last-name-input"
            name="reg-last-name-input"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              setLastNameError(false);
            }}
          ></input>
          {lastNameError && (
            <p className="error-msg" id="reg-last-name-error">
              last name field cannot be empty
            </p>
          )}
        </div>

        {/* display name input field */}
        <div className="input-group">
          <label htmlFor="reg-display-name-input">Display Name *</label>
          <input
            id="reg-display-name-input"
            name="reg-display-name-input"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              setDisplayNameError(false);
            }}
          ></input>
          {displayNameError &&
            (displayName.trim().length === 0 ? (
              <p className="error-msg" id="reg-display-name-error">
                Display name field cannot be empty
              </p>
            ) : (
              <p className="error-msg" id="reg-display-name-error">
                Display name already exists. Please use another.
              </p>
            ))}
        </div>

        {/* Email input */}
        <div className="input-group">
          <label htmlFor="reg-email-input">Email *</label>
          <input
            id="reg-email-input"
            name="reg-email-input"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(false);
              setEmailDup(false);
            }}
          ></input>
          {emailError && email.length === 0 && (
            <p className="error-msg" id="reg-email-error">
              Email field cannot be empty
            </p>
          )}
          {emailError && emailDup && (
            <p className="error-msg" id="reg-email-error">
              Email is already in use. Please select another one.
            </p>
          )}
          {emailError &&
            emailRegex.test(email) === false &&
            email.length !== 0 && (
              <p className="error-msg" id="reg-email-error">
                Email must be in a proper form. Example: myEmail@domain.com
              </p>
            )}
        </div>

        {/* password input */}
        <div className="input-group">
          <label htmlFor="reg-pw-input">Password *</label>
          <input
            id="reg-pw-input"
            name="reg-pw-input"
            value={pw}
            onChange={(e) => {
              setPw(e.target.value);
              setPwError(false);
            }}
          ></input>
          {pwError && pw.length === 0 && (
            <p className="error-msg" id="reg-pw-error">
              Password field cannot be empty
            </p>
          )}
          {pwError && pw !== confirmPw && (
            <p className="error-msg" id="reg-pw-error">
              Password confirmation does not match the password
            </p>
          )}
          {pwError &&
            pw.length !== 0 &&
            (pw.includes(firstName) ||
              pw.includes(lastName) ||
              pw.includes(displayName) ||
              pw.includes(email)) && (
              <p className="error-msg" id="reg-pw-error">
                Password cannot include your first name, display name, or email
              </p>
            )}
        </div>

        {/* password confirmation input */}
        <div className="input-group">
          <label htmlFor="reg-confirmPw-input">Confirm Password *</label>
          <input
            id="reg-confirmPw-input"
            name="reg-confirmPw-input"
            value={confirmPw}
            onChange={(e) => {
              setConfirmPw(e.target.value);
            }}
          ></input>
        </div>

        <button className="btn-submit" onClick={(e) => handleSubmit(e)}>
          Submit
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;
