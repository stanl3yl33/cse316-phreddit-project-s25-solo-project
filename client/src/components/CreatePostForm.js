import { usePhredditContext } from "./PhredditContext";
import { useEffect, useState } from "react";
import { linkValidity } from "../utils/link-util";
import axios from "axios";

function CreatePostForm() {
  const {
    setMode,
    resetState,
    setSelectedCommunity,
    communities,
    setCommunities,
    sessionUser,
  } = usePhredditContext();

  const [flairOpts, setFlairOpts] = useState([]);

  // post content
  const [postContent, setPostContent] = useState("");
  const [postContentErr, setPostContentErr] = useState(false);
  const [validLinkErr, setValidLinkErr] = useState(false);

  // post title state
  const [postTitle, setPostTitle] = useState("");
  const [postTitleErr, setPostTitleErr] = useState(false);

  // select community state
  const [selectCommunity, setSelectCommunity] = useState("");
  const [selectCommunityErr, setSelectCommunityErr] = useState(false);

  // flair state
  const [createFlair, setCreateFlair] = useState("");
  const [chooseFlair, setChooseFlair] = useState("");
  const [flairErr, setFlairErr] = useState(false);

  const [communityLists, setCommunityList] = useState([]);

  //reset the selectedCommunityState to fix the highlighted bug
  useEffect(
    function () {
      // minor bug fix here
      setSelectedCommunity("");

      // apply community split here:
      if (sessionUser) {
        // Separate into member vs non-member
        const memberCommunities = communities.filter((c) =>
          c.members.includes(sessionUser._id)
        );
        const nonMemberCommunities = communities.filter(
          (c) => !c.members.includes(sessionUser._id)
        );

        setCommunityList([...memberCommunities, ...nonMemberCommunities]);
      } else {
        setCommunityList(communities);
      }
    },
    [setSelectedCommunity, communities, sessionUser]
  );

  useEffect(function () {
    // need to fetch current flair options, to move away from the model.js dependecy:
    async function setup() {
      try {
        const res = await axios.get(`http://localhost:8000/linkflairs`);
        setFlairOpts(res.data);
      } catch (err) {
        console.log(
          "Something went wrong when getting the link flairs for post form",
          err
        );
      }
    }

    setup();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    let err = false;
    // error checking:
    if (selectCommunity === "") {
      err = true;
      setSelectCommunityErr(true);
      // postCommunityErr.innerHTML = "You must select a community";
    } else {
      setSelectCommunityErr(false);
    }

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
              cID: selectCommunity,
              title: postTitle,
              content: postContent,
            }
          : {
              cID: selectCommunity,
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
      //   flairOption
      // );

      await axios.post(`http://localhost:8000/posts`, payload);
      // const res = await axios.post(`http://localhost:8000/posts`, payload);
      // console.log(res);

      // need to refetch the community and set the global communities context, without it, the postList item will display the community of the newly created post as Unknown since its techincally not their in the context yet:
      const resCom = await axios.get(`http://localhost:8000/communities`);
      setCommunities(resCom.data);

      // need to update the global post list
      resetState();
      // switch modes back to home
      setMode("home");
    }
  }

  return (
    <form className="create-post-form">
      <h2>Create a New Post</h2>

      <div className="input-group">
        <label htmlFor="select-community">Choose a Community *</label>
        <select
          id="select-community"
          name="select-community"
          value={selectCommunity}
          onChange={(e) => {
            setSelectCommunity(e.target.value);
            setSelectCommunityErr(false);
          }}
        >
          <option value="">--Choose from existing communities--</option>
          {/* use map here to render dynamically */}
          {communityLists.map((com) => (
            <option key={com._id} value={com._id}>
              {com.name}
            </option>
          ))}
        </select>

        {selectCommunityErr && (
          <p className="error-msg" id="post-community-error">
            You must select a community
          </p>
        )}
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
        Submit Post
      </button>
    </form>
  );
}

export default CreatePostForm;
