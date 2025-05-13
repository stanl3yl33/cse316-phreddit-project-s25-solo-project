import { usePhredditContext } from "./PhredditContext";
import { useEffect, useState } from "react";
import { linkValidity } from "../utils/link-util";
import axios from "axios";
import ConfirmScreen from "./ConfirmScreen";

function EditPostForm() {
  const { setMode, setSelectedCommunity, editPostID, setCurrentPostList } =
    usePhredditContext();

  const [flairOpts, setFlairOpts] = useState([]);

  // post content
  const [postContent, setPostContent] = useState("");
  const [postContentErr, setPostContentErr] = useState(false);
  const [validLinkErr, setValidLinkErr] = useState(false);

  // post title state
  const [postTitle, setPostTitle] = useState("");
  const [postTitleErr, setPostTitleErr] = useState(false);

  // flair state
  const [createFlair, setCreateFlair] = useState("");
  const [chooseFlair, setChooseFlair] = useState("");
  const [flairErr, setFlairErr] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  //reset the selectedCommunityState to fix the highlighted bug

  useEffect(() => {
    if (!confirmDelete) return;

    async function deletePost() {
      try {
        await axios.delete(`http://localhost:8000/posts/${editPostID}`, {
          data: { id: editPostID, type: "post" },
          withCredentials: true,
        });

        const res = await axios.get(`http://localhost:8000/posts/`);
        setCurrentPostList(res.data);
        setMode("userProfile");
      } catch (err) {
        console.error("Failed to delete post:", err);
      } finally {
        setShowConfirm(false);
        setConfirmDelete(false);
      }
    }

    deletePost();
  }, [confirmDelete, editPostID, setMode, setCurrentPostList]);

  useEffect(
    function () {
      // minor bug fix here
      setSelectedCommunity("");
    },
    [setSelectedCommunity]
  );

  useEffect(
    function () {
      // need to fetch current flair options, to move away from the model.js dependecy:
      async function setup() {
        try {
          const res = await axios.get(`http://localhost:8000/linkflairs`);
          setFlairOpts(res.data);
          const postRes = await axios.get(
            `http://localhost:8000/posts/edit/${editPostID}`
          );

          const postInfo = postRes.data;

          // prefill the fields:
          setPostTitle(postInfo.title);
          setPostContent(postInfo.content);

          if (postInfo.linkFlairID) {
            // get the full flair object by matching _id
            const matchedFlair = res.data.find(
              (fl) => fl._id === postInfo.linkFlairID
            );
            if (matchedFlair) {
              setChooseFlair(matchedFlair.content); // select flair in dropdown
            }
          }
        } catch (err) {
          console.log(
            "Something went wrong when getting the link flairs for post form",
            err
          );
        }
      }

      setup();
    },
    [editPostID]
  );

  function handleDelete(e) {
    e.preventDefault();
    setShowConfirm(true);
  }

  function onDeny() {
    setShowConfirm(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // console.log("select com: ", selectCommunity);

    // console.log("creating post");
    let err = false;
    // error checking:
    // post title check:
    if (postTitle.length === 0) {
      err = true;
      setPostTitleErr(true);
    } else if (postTitle.length > 100) {
      err = true;
      setPostTitleErr(true);
    } else {
      setPostTitleErr(false);
    }
    console.log(postTitle.length);

    // create post + flair(if chosen)
    if (postContent.length === 0) {
      err = true;
      setPostContentErr(true);
    } else {
      setPostContentErr(false);
    }

    // checking link []()
    if (linkValidity(postContent) === false) {
      err = true;
      setValidLinkErr(true);
      setPostContentErr(true);
    } else {
      setValidLinkErr(false);
    }

    // flair case:
    if (chooseFlair !== "" && createFlair.length !== 0) {
      err = true;
      setFlairErr(true);
    } else if (createFlair.length > 30) {
      err = true;
      setFlairErr(true);
    } else {
      setFlairErr(false);
    }

    if (err === false) {
      let flairOption = "";

      //  either one of the if statements will be true
      if (chooseFlair !== "") {
        flairOption = chooseFlair;
      }

      if (createFlair.length !== 0) {
        flairOption = createFlair;
      }

      // payload will either include an existing flair._id or new content or neight if the flair has no content i.e. .length is 0
      const payload =
        flairOption.length === 0
          ? {
              id: editPostID,
              type: "post",
              title: postTitle,
              content: postContent,
            }
          : {
              id: editPostID,
              type: "post",
              title: postTitle,
              content: postContent,
              flair: flairOption,
            };
      // creates post and insert into model + create new flairs if need be
      // Leaving flairOption as "" will result in no flair in post option
      // model.createPost(
      //   selectCommunity,
      //   postTitle,
      //   postContent,
      //   creator,
      //   flairOption
      // );

      await axios.patch(`http://localhost:8000/posts/${editPostID}`, payload);
      // const res = await axios.post(`http://localhost:8000/posts`, payload);
      // console.log(res);

      // fetch and update posts instead of global reset
      const res = await axios.get(`http://localhost:8000/posts/`);
      setCurrentPostList(res.data);

      // switch modes back to home
      setMode("userProfile");
    }
  }

  return (
    <>
      {showConfirm && (
        <ConfirmScreen
          msg={"Are you sure you want to delete this post"}
          onConfirm={() => setConfirmDelete(true)}
          onDeny={onDeny}
        />
      )}
      <form className="create-post-form">
        <div className="edit-header">
          <h2>Edit Post</h2>
          <button className="btn-delete" onClick={(e) => handleDelete(e)}>
            Delete
          </button>
        </div>
        <div className="input-group">
          <label htmlFor="post-title-input">Post Title *</label>
          <textarea
            id="post-title-input"
            name="post-title-input"
            placeholder="Required Input: Enter Post Title(max 100 characters)"
            value={postTitle}
            onChange={(e) => {
              setPostTitle(e.target.value);
              setPostTitleErr(false);
            }}
          ></textarea>
          {postTitleErr &&
            // <p className="error-msg hidden" id="post-title-error"></p>
            // either > 100 or just empty
            (postTitle.length > 100 ? (
              <p className="error-msg" id="post-title-error">
                Title cannot exceed 100 characters
              </p>
            ) : (
              <p className="error-msg" id="post-title-error">
                Title field cannot be empty
              </p>
            ))}
        </div>

        <div className="input-group-flair">
          <label htmlFor="select-flair">Choose Flair (optional)</label>
          <select
            id="select-flair"
            name="select-flair"
            value={chooseFlair}
            onChange={(e) => {
              setChooseFlair(e.target.value);
              setFlairErr(false);
            }}
          >
            <option value="">--No Flair Option--</option>
            {flairOpts.map((fl) => (
              <option key={fl._id} value={fl.content}>
                {fl.content}
              </option>
            ))}
          </select>

          <label htmlFor="create-flair-input">
            Or Create New Flair For Your Post (optional)
          </label>
          <textarea
            id="create-flair-input"
            name="create-flair-input"
            placeholder="Enter flair (30 characters max)"
            value={createFlair}
            onChange={(e) => {
              setCreateFlair(e.target.value);
              setFlairErr(false);
            }}
          ></textarea>
          {flairErr &&
            (chooseFlair !== "" && createFlair.length !== 0 ? (
              <p className="error-msg" id="post-flair-error">
                You can either select a flair or create a new flair, NOT both
              </p>
            ) : (
              <p className="error-msg" id="post-flair-error">
                Custom flair can be at most 30 characters long
              </p>
            ))}
        </div>

        <div className="input-group">
          <label htmlFor="post-content-input">Post Content *</label>
          <textarea
            id="post-content-input"
            name="post-content-input"
            placeholder="Required Input: Enter post content (Cannot be empty)"
            value={postContent}
            onChange={(e) => {
              setPostContent(e.target.value);
              setPostContentErr(false);
              setValidLinkErr(false);
            }}
          ></textarea>
          {postContentErr && (
            <>
              {postContent.length === 0 && (
                <p className="error-msg" id="post-content-error">
                  Content field cannot be empty
                </p>
              )}
              {validLinkErr && (
                <p className="error-msg">
                  Links must follow the format [text](https://link or http://),
                  with non-empty text and a valid http/https URL.
                </p>
              )}
            </>
          )}
        </div>

        <button
          className="btn-submit"
          id="submit-post"
          onClick={(e) => handleSubmit(e)}
        >
          Edit Post
        </button>
      </form>
    </>
  );
}

export default EditPostForm;
