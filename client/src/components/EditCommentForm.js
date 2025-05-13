import { useState, useEffect } from "react";
import { usePhredditContext } from "./PhredditContext";
import { linkValidity } from "../utils/link-util";
import axios from "axios";
import ConfirmScreen from "./ConfirmScreen";

function EditCommentForm() {
  const { setMode, editCommentID, setCurrentPostList } = usePhredditContext();
  const [comment, setComment] = useState(null);
  const [commentContent, setCommentContent] = useState("");
  const [commentContentErr, setCommentContentErr] = useState(false);
  const [validLinkErr, setValidLinkErr] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleDelete(e) {
    e.preventDefault();
    setShowConfirm(true);
  }

  useEffect(() => {
    if (!confirmDelete) return;

    async function deleteComment() {
      try {
        await axios.delete(`http://localhost:8000/comments/${editCommentID}`, {
          data: { id: editCommentID, type: "comment" },
          withCredentials: true,
        });

        // update the currrent post list so that each post have the correct comments
        const res = await axios.get(`http://localhost:8000/posts/`);
        setCurrentPostList(res.data);
        setMode("userProfile");
      } catch (err) {
        console.error("Failed to delete comment:", err);
      } finally {
        setShowConfirm(false);
        setConfirmDelete(false);
      }
    }

    deleteComment();
  }, [confirmDelete, editCommentID, setCurrentPostList, setMode]);

  useEffect(() => {
    async function fetchComment() {
      try {
        const res = await axios.get(
          `http://localhost:8000/comments/${editCommentID}`,
          { withCredentials: true }
        );
        setComment(res.data);
        setCommentContent(res.data.content);
      } catch (err) {
        console.error("Error fetching comment to edit:", err);
      }
    }

    if (editCommentID) {
      fetchComment();
    }
  }, [editCommentID]);

  async function handleCommentSubmit(e) {
    e.preventDefault();

    let err = false;

    if (commentContent.length === 0 || commentContent.length > 500) {
      setCommentContentErr(true);
      err = true;
    } else {
      setCommentContentErr(false);
    }

    if (!linkValidity(commentContent)) {
      setValidLinkErr(true);
      setCommentContentErr(true);
      err = true;
    } else {
      setValidLinkErr(false);
    }

    if (!err) {
      const payload = {
        type: "comment",
        id: editCommentID,
        content: commentContent,
      };

      try {
        await axios.patch(
          `http://localhost:8000/comments/${editCommentID}`,
          payload,
          { withCredentials: true }
        );
        setMode("userProfile");
      } catch (err) {
        console.error("Error submitting edited comment:", err);
      }
    }
  }

  return (
    <>
      {showConfirm && (
        <ConfirmScreen
          msg={"Are you sure you want to delete this comment"}
          onConfirm={() => setConfirmDelete(true)}
          onDeny={() => setShowConfirm(false)}
        />
      )}
      <form className="create-comment-form">
        <div className="edit-header">
          <h2>Edit Comment</h2>
          <button className="btn-delete" onClick={(e) => handleDelete(e)}>
            Delete
          </button>
        </div>

        <div className="input-group">
          <label htmlFor="comment-input">Comment *</label>
          <textarea
            id="comment-input"
            name="comment-input"
            placeholder="Enter edited comment (max 500 characters)"
            value={commentContent}
            onChange={(e) => {
              setCommentContent(e.target.value);
              setCommentContentErr(false);
              setValidLinkErr(false);
            }}
          ></textarea>

          {commentContentErr && (
            <>
              {commentContent.length === 0 && (
                <p className="error-msg">Comment must not be empty</p>
              )}
              {commentContent.length > 500 && (
                <p className="error-msg">
                  Comment cannot exceed 500 characters
                </p>
              )}
              {validLinkErr && (
                <p className="error-msg">
                  Links must follow [text](http(s)://url) format
                </p>
              )}
            </>
          )}
        </div>

        <button className="btn-submit" onClick={handleCommentSubmit}>
          Submit Changes
        </button>
      </form>
    </>
  );
}

export default EditCommentForm;
