// Weird bug/issue relating to keys and inserting links
// need to add a key to the inserted anchor, else the error / warning persists
// returns a list of substrings and <a> (if any does match correctly) of the passed in str
// allows the components that need to do []() match to utilize and display it
export function insertLink(str) {
  const regex = /\[(.+)\]\((.+)\)/g;

  // store the accumulated comment and return it to be
  const content = [];
  const strLength = str.length;

  //.exec -> returns array of matched stuff
  // index 0 => full matched query
  // index 1 => content in [] i.e. content of link
  // index 2 => content in () i.e. href / link to the website

  // Finds each substring that match (content inside)[https:// or http://]
  let curIndex = 0;
  let keyIndex = 0;
  let parsedStr = regex.exec(str);
  while (parsedStr !== null) {
    // .exec returns parsed obj that has index field === start of the parsed str (i.e. the '(' char)

    // Goal - add the before content if any, else it just pushes the content into the array
    // case - push content that appears before the first match
    parsedStr.index > curIndex &&
      content.push(str.substring(curIndex, parsedStr.index));

    //update the curIndex to point to index that is right after the matched spot in this current iteration
    //parsedStr[0] -> yields the entire matched substring
    let totalLength = parsedStr[0].length;
    curIndex = parsedStr.index + totalLength;

    // pushed the anchor tag with the link
    // target="_blank" rel="noopener noreferrer" ===> opens the links on new tab instead of current
    content.push(
      <a
        href={parsedStr[2]}
        target="_blank"
        rel="noopener noreferrer"
        key={`${keyIndex}-link-key`}
      >
        {parsedStr[1]}
      </a>
    );

    //move onto the next match if any
    parsedStr = regex.exec(str);

    // fix for key
    keyIndex++;
  }

  //adds remaining lines if any (done via shortcircuiting &&)
  curIndex < strLength && content.push(str.substring(curIndex));

  return content;
}

// to be use in the forms
// returns true if the provide str has ()[] pattern and if appropriate content in it, else it returns false
export function linkValidity(str) {
  const regex = /\[([^\]]*)\]\(([^)]*)\)/g;
  const linkRegex = /^(https:\/\/|http:\/\/).+/;

  let parsedArr = regex.exec(str);
  while (parsedArr !== null) {
    // index 0 => full matched pattern
    // index 1 => content inside []
    // index 2 => content inside ()

    // content
    if (parsedArr[1].trim() === "") {
      // console.log(parsedArr[1].trim());
      // console.log("printing");
      // needs to have content inside it
      return false;
    }

    // link
    if (linkRegex.test(parsedArr[2].trim()) === false) {
      return false;
    }

    // moveonto next match if any
    parsedArr = regex.exec(str);
  }

  return true;
}
