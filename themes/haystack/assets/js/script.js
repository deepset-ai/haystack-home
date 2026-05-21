// Main js file loaded in the footer partial
import { navigation } from "./navigation";
import { accordions } from "./accordions";
import { newsletters } from "./newsletters";
import { githubStats } from "./github-stats";
import { githubStarsFireworks } from "./github-stars-fireworks";
import { landingCelebration } from "./landing-celebration";
import { ambassadorForm } from "./ambassador-form";

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
ready(githubStarsFireworks);
ready(landingCelebration);
ready(ambassadorForm);
