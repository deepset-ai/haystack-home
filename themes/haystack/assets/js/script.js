// Main js file loaded in the footer
import { navigation } from "./navigation";
import { accordions } from "./accordions";
import { newsletters } from "./newsletters";
import { githubStats } from "./github-stats";

const ready = (fn) => {
  if (document.readyState != "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
};

ready(navigation);
ready(accordions);
ready(newsletters);
ready(githubStats);
