import { createContext, useContext, useState, useEffect } from "react";
// import Model from "../models/model";
import axios from "axios";
// create context:
const PhredditContext = createContext();

function PhredditProvider({ children }) {
  //setting up global values to be provided

  // the actual value lives in '.current'
  // should be sorted by newest by default
  const [currentPostList, setCurrentPostList] = useState([]);
  const [curPost, setCurPost] = useState(null);
  const [replyTo, setReplyTo] = useState(null);

  // used for conditional rendering
  const [mode, setMode] = useState("home"); // home | post | search | ....

  const [page, setPage] = useState("welcome");
  // welcome | register | login | phreddit

  // used for the search bar
  const [searchQuery, setSearchQuery] = useState("");

  //used for rendering community view
  // pass in the community id perhaps
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  const [communities, setCommunities] = useState([]);

  const [sessionUser, setSessionUser] = useState(null); // default guest -> null

  // new state used for user profile
  const [viewedUser, setViewedUser] = useState(null);

  //used for toggling edits
  const [editCommentID, setEditCommentID] = useState(null);
  const [editCommunityID, setEditCommunityID] = useState(null);
  const [editPostID, setEditPostID] = useState(null);

  // useEffect to fetch the initial data from mongodb database:
  useEffect(() => {
    async function fetchData() {
      try {
        // get session user if ther is already an existing one
        const sessionRes = await axios.get(
          "http://localhost:8000/authenticate/session"
        );

        // check if session exist or not, if it does create two sublist and sort accordingly:
        if (sessionRes.data && sessionRes.data.user) {
          setSessionUser(sessionRes.data.user);
          setPage("phreddit");

          const user = sessionRes.data.user;

          const communityRes = await axios.get(
            "http://localhost:8000/communities"
          );
          const postRes = await axios.get("http://localhost:8000/posts");

          const communitiesData = communityRes.data;
          const postsData = postRes.data;

          // get user communities:
          const memberCommunities = communitiesData.filter((c) =>
            c.members.includes(user._id)
          );
          const nonMemberCommunities = communitiesData.filter(
            (c) => !c.members.includes(user._id)
          );
          setCommunities([...memberCommunities, ...nonMemberCommunities]);

          // get the post for spec user:
          const memberPosts = postsData.filter((post) =>
            memberCommunities.some((c) => c.postIDs.includes(post._id))
          );
          const nonMemberPosts = postsData.filter(
            (post) => !memberPosts.includes(post)
          );
          const sorted = [...memberPosts, ...nonMemberPosts].sort(
            (a, b) => new Date(b.postedDate) - new Date(a.postedDate)
          );
          setCurrentPostList(sorted);
        } else {
          // default guest view data
          setSessionUser(null);
          setPage("welcome");
          const communityRes = await axios.get(
            "http://localhost:8000/communities"
          );
          setCommunities(communityRes.data);
          // console.log("fetched community:");
          // console.log(communityRes.data);

          const postRes = await axios.get("http://localhost:8000/posts");

          // sort the data from db as newest to oldest according to doc specification
          const sortedPosts = postRes.data.sort(
            (a, b) => new Date(b.postedDate) - new Date(a.postedDate)
          );
          setCurrentPostList(sortedPosts);
          // console.log("Fetched posts:", sortedPosts);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    }

    fetchData();
  }, []);

  //used for resetting the state, i.e. clicking on logo or home button etc.
  //used for resetting the state, i.e. clicking on logo or home button etc.
  async function resetState() {
    setMode("home");
    setSearchQuery("");
    setCurPost(null);
    setReplyTo(null);
    setSelectedCommunity(null);

    if (sessionUser) {
      const communityRes = await axios.get("http://localhost:8000/communities");
      const postRes = await axios.get("http://localhost:8000/posts");

      const communitiesData = communityRes.data;
      const postsData = postRes.data;

      // reorder communities so joined ones come first
      const memberCommunities = communitiesData.filter((c) =>
        c.members.includes(sessionUser._id)
      );
      const nonMemberCommunities = communitiesData.filter(
        (c) => !c.members.includes(sessionUser._id)
      );
      setCommunities([...memberCommunities, ...nonMemberCommunities]);

      // reorder posts so user's community posts come first
      const memberPosts = postsData.filter((post) =>
        memberCommunities.some((c) => c.postIDs.includes(post._id))
      );
      const nonMemberPosts = postsData.filter(
        (post) => !memberPosts.some((mp) => mp._id === post._id)
      );

      const sortedMemberPosts = memberPosts.sort(
        (a, b) => new Date(b.postedDate) - new Date(a.postedDate)
      );
      const sortedNonMemberPosts = nonMemberPosts.sort(
        (a, b) => new Date(b.postedDate) - new Date(a.postedDate)
      );

      const combined = [...sortedMemberPosts, ...sortedNonMemberPosts];
      setCurrentPostList(combined);
    } else {
      // guest view
      const postRes = await axios.get("http://localhost:8000/posts");
      const sortedPosts = postRes.data.sort(
        (a, b) => new Date(b.postedDate) - new Date(a.postedDate)
      );
      setCurrentPostList(sortedPosts);
    }
  }

  const initialStates = {
    // model: model.current,
    currentPostList,
    setCurrentPostList,
    curPost,
    setCurPost,
    replyTo,
    setReplyTo,
    mode,
    setMode,
    searchQuery,
    setSearchQuery,
    selectedCommunity,
    setSelectedCommunity,
    communities,
    setCommunities,
    resetState,
    page,
    setPage,
    sessionUser,
    setSessionUser,
    viewedUser,
    setViewedUser,
    editCommentID,
    setEditCommentID,
    editCommunityID,
    setEditCommunityID,
    editPostID,
    setEditPostID,
  };

  return (
    <PhredditContext.Provider value={initialStates}>
      {children}
    </PhredditContext.Provider>
  );
}

function usePhredditContext() {
  const context = useContext(PhredditContext);

  if (context === undefined)
    throw new Error("Contetxt was used out of the scope of the provider");

  return context;
}

export { usePhredditContext, PhredditProvider };
