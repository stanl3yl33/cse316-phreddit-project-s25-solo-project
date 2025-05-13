import axios from "axios";
import { usePhredditContext } from "./PhredditContext";

function SortingButtons() {
  const { setCurrentPostList, currentPostList, sessionUser, communities } =
    usePhredditContext();

  // returns 2 list: one session base and the other = rest of list
  // if no session, session list will be empty arr and other will just contain all post
  function splitPosts() {
    if (!sessionUser) {
      return {
        memPosts: currentPostList,
        nonMemPosts: [],
      };
    }

    // filter out the communities that have the current user
    const memberCommunities = communities.filter((c) =>
      c.members.includes(sessionUser._id)
    );

    // get related post to current user
    const relatedPosts = currentPostList.filter((post) =>
      memberCommunities.some((c) => c.postIDs.includes(post._id))
    );

    // excludes whatever is in related post to get the rest of the posts
    const leftOverPosts = currentPostList.filter(
      (post) => !relatedPosts.includes(post)
    );

    return {
      memPosts: relatedPosts,
      nonMemPosts: leftOverPosts,
    };
  }

  // new sort and old sort sorts currentPostList context
  function handleNewSort() {
    // get posts lists
    const { memPosts, nonMemPosts } = splitPosts();

    // sort both respectively and then combine the two list to have 2 'sublist'
    const sorted = [
      ...memPosts.sort(
        (a, b) => new Date(b.postedDate) - new Date(a.postedDate)
      ),
      ...nonMemPosts.sort(
        (a, b) => new Date(b.postedDate) - new Date(a.postedDate)
      ),
    ];

    // const sorted = [...currentPostList].sort(
    //   (a, b) => new Date(b.postedDate) - new Date(a.postedDate)
    // );
    setCurrentPostList(sorted);
  }

  function handleOldSort() {
    // get posts lists
    const { memPosts, nonMemPosts } = splitPosts();

    // sort both respectively and then combine the two list to have 2 'sublist'
    const sorted = [
      ...memPosts.sort(
        (a, b) => new Date(a.postedDate) - new Date(b.postedDate)
      ),
      ...nonMemPosts.sort(
        (a, b) => new Date(a.postedDate) - new Date(b.postedDate)
      ),
    ];
    // const sorted = [...currentPostList].sort(
    //   (a, b) => new Date(a.postedDate) - new Date(b.postedDate)
    // );
    setCurrentPostList(sorted);
  }

  // requires get to get comments, no access to model.js now
  async function handleActiveSort() {
    try {
      const { memPosts, nonMemPosts } = splitPosts();

      // converted into func to apply it to the 2 splitted list instead of hard coding it to curPostlist
      async function sortByActivity(posts) {
        const postMap = new Map();

        for (const post of posts) {
          const res = await axios.get(
            `http://localhost:8000/comments/post/${post._id}`
          );
          const comments = res.data;

          let latestDate = null;
          for (const comment of comments) {
            const date = new Date(comment.commentedDate);
            if (!latestDate || date > latestDate) {
              latestDate = date;
            }
          }

          postMap.set(post, latestDate);
        }

        return Array.from(postMap)
          .sort((a, b) => {
            const aDate = a[1],
              bDate = b[1];
            if (!aDate && !bDate) return 0;
            if (!aDate) return 1;
            if (!bDate) return -1;
            return bDate - aDate;
          })
          .map(([post]) => post);
      }

      const sortedMemPosts = await sortByActivity(memPosts);
      const sortedNonMemPosts = await sortByActivity(nonMemPosts);
      setCurrentPostList([...sortedMemPosts, ...sortedNonMemPosts]);
    } catch (err) {
      console.error("Failed to sort posts by activity:", err);
    }
  }

  return (
    <span className="sort-btns">
      <button id="btn-newest" className="sort-btn" onClick={handleNewSort}>
        Newest
      </button>
      <button id="btn-oldest" className="sort-btn" onClick={handleOldSort}>
        Oldest
      </button>
      <button id="btn-active" className="sort-btn" onClick={handleActiveSort}>
        Active
      </button>
    </span>
  );
}

export default SortingButtons;
