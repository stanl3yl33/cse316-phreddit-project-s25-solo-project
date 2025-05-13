export function timeStamp(t) {
  // t -> time of whatever is passed (ex time of post or time of comment)
  const now = Date.now();
  const time = new Date(t).getTime();
  const interval = now - time; // returns time frame in milisec

  // converting the calculated interval to other units of time
  const secs = interval / 1000;
  const mins = secs / 60;
  const hrs = mins / 60;
  const days = hrs / 24;
  const mos = days / 30;
  const yrs = mos / 12;

  if (secs < 60) {
    // seconds ago case
    return `${Math.floor(secs)} second${secs > 1 ? "s" : ""} ago`;
  } else if (mins < 60) {
    // minutes ago case
    return `${Math.floor(mins)} minute${mins > 1 ? "s" : ""} ago`;
  } else if (hrs < 24) {
    // hours ago case
    return `${Math.floor(hrs)} hour${hrs > 1 ? "s" : ""} ago`;
  } else if (days < 30) {
    // days ago case
    return `${Math.floor(days)} day${days > 1 ? "s" : ""} ago`;
  } else if (mos < 30) {
    //mos ago
    return `${Math.floor(mos)} month${mos > 1 ? "s" : ""} ago`;
  } else {
    // years ago case
    return `${Math.floor(yrs)} year${yrs > 1 ? "s" : ""} ago`;
  }
}
