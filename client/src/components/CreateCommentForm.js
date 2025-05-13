import { useState } from "react";
import { usePhredditContext } from "./PhredditContext";
import { linkValidity } from "../utils/link-util";
import axios from "axios";

function CreateCommentForm() {
  // use cID to reply to comment
  const { setMode, replyTo } = usePhredditContext();

  const [commentContent, setCommentContent] = useState("");
  const [commentContentErr, setCommentContentErr] = useState(false);

  const [validLinkErr, setValidLinkErr] = useState(false);

  async function handleCommentSubmit(e) {
    e.preventDefault();
    // setMode("post");
    // console.log(`Replying to ${replyTo}`);

    let err = false;

    // Need to add the new href hyperlink error
    if (commentContent.length === 0) {
      err = true;
      setCommentContentErr(true);
    } else if (commentContent.length > 500) {
      err = true;
      setCommentContentErr(true);
    } else {
      setCommentContentErr(false);
    }

    // console.log("is the link valids");
    // console.log(linkValidity(commentContent));

    if (linkValidity(commentContent) === false) {
      err = true;
      setValidLinkErr(true);
      setCommentContentErr(true);
    } else {
      setValidLinkErr(false);
    }
    console.log(replyTo);
    if (err === false) {
      const payload = {
        id: replyTo,
        content: commentContent,
      };

      try {
        // const res = await axios.post(
        //   `http://localhost:8000/comments/`,
        //   payload
        // );
        // console.log(res.data);

        await axios.post(`http://localhost:8000/comments/`, payload);
      } catch (err) {
        console.error("Something went wrong when making a reply: ", err);
      }

      setMode("post");
    }
  }

  return (
    <form className="create-comment-form">
      <h2>Add a Comment</h2>

      <div className="input-group">
        <label htmlFor="comment-input">Comment *</label>
        <textarea
          id="comment-input"
          name="comment-input"
          placeholder="Required Input: Enter comment (max 500 characters | required)"
          value={commentContent}
          onChange={(e) => {
            setCommentContent(e.target.value);

            // removes error msg upon typing in input box
            setCommentContentErr(false);
            setValidLinkErr(false);
          }}
        ></textarea>

        {commentContentErr && (
          <>
            {commentContent.length === 0 && (
              <p className="error-msg">Content of comment must not be empty</p>
            )}
            {commentContent.length > 500 && (
              <p className="error-msg">
                The comment cannot exceed 500 characters
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
        id="submit-comment"
        onClick={(e) => handleCommentSubmit(e)}
      >
        Submit Comment
      </button>
    </form>
  );
}

export default CreateCommentForm;
