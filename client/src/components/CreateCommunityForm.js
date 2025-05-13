import { usePhredditContext } from "./PhredditContext";
import { useEffect, useState } from "react";
import { linkValidity } from "../utils/link-util";
import axios from "axios";

function CreateCommunityForm() {
  const {
    setCommunities,
    setMode,
    setSelectedCommunity,
    setCurrentPostList,
    communities,
  } = usePhredditContext();

  //using controlled inputs now, instead of directly access the html
  const [communityName, setCommunityName] = useState("");
  const [communityNameError, setCommunityNameErr] = useState(false);
  const [description, setDescription] = useState("");
  const [descError, setDescError] = useState(false);
  const [validLinkErr, setValidLinkErr] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  //reset the selectedCommunityState to fix the highlighted bug
  useEffect(
    function () {
      // resetState();
      // minor bug fix here
      setSelectedCommunity("");
    },
    [setSelectedCommunity]
  );

  //error handling
  async function handleSubmit(e) {
    e.preventDefault();
    // console.log("submitting the community form");

    let err = false;
    if (communityName.length === 0 || communityName.length > 100) {
      setCommunityNameErr(true);
      err = true;
    } else {
      setCommunityNameErr(false);
    }

    // Check for duplicate community name (case-insensitive)
    const duplicate = communities.find(
      (c) => c.name.toLowerCase() === communityName.toLowerCase()
    );

    if (duplicate) {
      setCommunityNameErr(true);
      setIsDuplicate(true);
      err = true;
    } else {
      setIsDuplicate(false);
    }

    if (description.length === 0 || description.length > 500) {
      setDescError(true);
      err = true;
    } else {
      setDescError(false);
    }

    if (linkValidity(description) === false) {
      err = true;
      setValidLinkErr(true);
      setDescError(true);
    } else {
      setValidLinkErr(false);
    }

    //CREATE POST OBJ (UPDATE MODEL REF + CONTEXT COMMUNITY GLOBAL LIST)
    if (!err) {
      // console.log("creating post");
      const name = communityName;
      const desc = description;
      // console.log(name, desc, creator);

      const payload = {
        name: name,
        description: desc,
      };
      try {
        const res = await axios.post(
          "http://localhost:8000/communities",
          payload
        );
        // console.log(res.data);
        setSelectedCommunity(res.data._id);

        const newID = res.data._id;

        const postRes = await axios.get(
          `http://localhost:8000/communities/${newID}/posts`
        );

        // set current post to only to newly created community post
        setCurrentPostList(postRes.data);

        // refresh communities on the navbar
        const updatedCommunities = await axios.get(
          "http://localhost:8000/communities"
        );
        setCommunities(updatedCommunities.data);

        setMode("community");
      } catch (err) {
        console.error("Something went wrong when making community: ", err);
      }
    }
  }

  return (
    <form className="create-community-form">
      <h2>Create Community</h2>

      <div className="input-group">
        <label htmlFor="community-name-input">Community Name *</label>
        <textarea
          id="community-name-input"
          name="community-name"
          value={communityName}
          onChange={(e) => {
            setCommunityName(e.target.value);
            setCommunityNameErr(false);
            setIsDuplicate(false);
          }}
          placeholder="Required Input: Enter Community Name (Max 100 characters)"
        />
        {communityNameError && (
          <>
            <p className="error-msg" id="community-name-error">
              {communityName.length === 0 && "Name cannot be empty"}
              {communityName.length > 100 &&
                "Name must be less than or equal to 100 characters"}
            </p>
            {isDuplicate && (
              <p className="error-msg">
                That community name is taken. Please choose another unique name.
              </p>
            )}
          </>
        )}
      </div>

      <div className="input-group">
        <label htmlFor="community-desc-input">Description *</label>
        <textarea
          id="community-desc-input"
          name="community-desc"
          placeholder="Required Input: Enter Community Description (Max 500 characters)"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setDescError(false);
            setValidLinkErr(false);
          }}
        ></textarea>
        {descError && (
          <>
            <p className="error-msg" id="community-desc-err">
              {description.length > 500 &&
                "Description must be less than or equal to 500 characters"}
              {description.length === 0 && "Description cannot be empty"}
            </p>
            {validLinkErr && (
              <p className="error-msg">
                Links must follow the format [text](https://link), with
                non-empty text and a valid http/https URL.
              </p>
            )}
          </>
        )}
      </div>

      <button
        className="btn-submit"
        id="submit-community"
        onClick={(e) => handleSubmit(e)}
      >
        Engender Community
      </button>
    </form>
  );
}

export default CreateCommunityForm;
