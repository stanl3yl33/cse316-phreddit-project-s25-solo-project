import { usePhredditContext } from "./PhredditContext";
import { useState } from "react";
import axios from "axios";
function SearchBar() {
  const {
    setCurrentPostList,
    setMode,
    setSelectedCommunity,
    setSearchQuery,
    sessionUser,
    communities,
  } = usePhredditContext();
  const [search, setSearch] = useState("");

  function handleChange(e) {
    setSearch(e.target.value);
  }

  async function handleEnter(e) {
    if (e.key === "Enter") {
      // makes a get request in the post/search route instead of modifying context
      try {
        const res = await axios.get(
          `http://localhost:8000/posts/search?q=${search}`
        );

        // get the search results (list of posts)
        // filter it out / split it into 2 lists (similar to the sorting button)
        if (sessionUser) {
          const posts = res.data;

          // get membership of current session user:
          const membership = communities.filter((com) =>
            com.members.includes(sessionUser._id)
          );

          // seperate posts into 2 lists based on the member ship
          const memPosts = posts.filter((post) =>
            membership.some((c) => c.postIDs.includes(post._id))
          );

          const nonMemPosts = posts.filter((post) => !memPosts.includes(post));

          // sort each list in newest order and combine the two:
          const sorted = [
            ...memPosts.sort(
              (a, b) => new Date(b.postedDate) - new Date(a.postedDate)
            ),
            ...nonMemPosts.sort(
              (a, b) => new Date(b.postedDate) - new Date(a.postedDate)
            ),
          ];

          setCurrentPostList(sorted);
          setMode("search");
          setSelectedCommunity(null);
          setSearchQuery(search);
        } else {
          setMode("search");
          setCurrentPostList(res.data);
          setSelectedCommunity(null);
          setSearchQuery(search);
        }
      } catch (err) {
        console.error(
          "Error - something went wrong while searching post: ",
          err
        );
      }
    }
  }

  return (
    <input
      className="search-bar"
      type="text"
      placeholder="Search Phreddit..."
      value={search}
      onChange={(e) => handleChange(e)}
      onKeyDown={(e) => handleEnter(e)}
    />
  );
}

export default SearchBar;
