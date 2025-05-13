import { usePhredditContext } from "./PhredditContext";
import { useEffect, useState } from "react";
import { linkValidity } from "../utils/link-util";
import axios from "axios";
import ConfirmScreen from "./ConfirmScreen";

function EditCommunityForm() {
  const { setCommunities, setMode, editCommunityID, setCurrentPostList } =
    usePhredditContext();

  //using controlled inputs now, instead of directly access the html
  const [communityName, setCommunityName] = useState("");
  const [communityNameError, setCommunityNameErr] = useState(false);
  const [description, setDescription] = useState("");
  const [descError, setDescError] = useState(false);
  const [validLinkErr, setValidLinkErr] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleDelete(e) {
    e.preventDefault();
    setShowConfirm(true);
  }

  useEffect(() => {
    if (!confirmDelete) return;

    async function deleteCommunity() {
      try {
        await axios.delete(
          `http://localhost:8000/communities/${editCommunityID}`,
          {
            data: { id: editCommunityID, type: "community" },
            withCredentials: true,
          }
        );

        // update post list to exclude posts that were deleted from deleting communities
        const res = await axios.get(`http://localhost:8000/posts/`);
        setCurrentPostList(res.data);

        // update the communities list as well on navbar:
        const communityRes = await axios.get(
          `http://localhost:8000/communities/`
        );
        setCommunities(communityRes.data);

        setMode("userProfile");
      } catch (err) {
        console.error("Failed to delete comment:", err);
      } finally {
        setShowConfirm(false);
        setConfirmDelete(false);
      }
    }

    deleteCommunity();
  }, [
    confirmDelete,
    editCommunityID,
    setCurrentPostList,
    setMode,
    setCommunities,
  ]);

  useEffect(() => {
    async function fetchCommunityForEdit() {
      try {
        const res = await axios.get(
          `http://localhost:8000/communities/${editCommunityID}`,
          { withCredentials: true }
        );
        const community = res.data;
        setCommunityName(community.name);
        setDescription(community.description);
      } catch (err) {
        console.error("Error fetching community for editing");
      }
    }

    fetchCommunityForEdit();
  }, [editCommunityID]);

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
        id: editCommunityID,
        type: "community",
        name: name,
        desc: desc,
      };
      try {
        await axios.patch(
          `http://localhost:8000/communities/${editCommunityID}`,
          payload,
          { withCredentials: true }
        );

        // refresh communities on the navbar
        const updatedCommunities = await axios.get(
          "http://localhost:8000/communities"
        );
        setCommunities(updatedCommunities.data);

        // go back to userProfile view
        setMode("userProfile");
      } catch (err) {
        console.error("Something went wrong when making community: ", err);
      }
    }
  }

  return (
    <>
      {showConfirm && (
        <ConfirmScreen
          msg={"Are you sure you want to delete this post"}
          onConfirm={() => setConfirmDelete(true)}
          onDeny={() => setShowConfirm(false)}
        />
      )}
      <form className="create-community-form">
        <div className="edit-header">
          <h2>Edit Community</h2>
          <button className="btn-delete" onClick={(e) => handleDelete(e)}>
            Delete
          </button>
        </div>
        <div className="input-group">
          <label htmlFor="community-name-input">Community Name *</label>
          <textarea
            id="community-name-input"
            name="community-name"
            value={communityName}
            onChange={(e) => {
              setCommunityName(e.target.value);
              setCommunityNameErr(false);
            }}
            placeholder="Required Input: Enter Community Name (Max 100 characters)"
          />
          {communityNameError && (
            <p className="error-msg" id="community-name-error">
              {communityName.length === 0 && "Name cannot be empty"}
              {communityName.length > 100 &&
                "Name must be less than or equal to 100 characters"}
            </p>
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
          Edit Community
        </button>
      </form>
    </>
  );
}

export default EditCommunityForm;
