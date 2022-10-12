// Main js file loaded in the footer partial
import { navigation } from "./navigation";
import { accordions } from "./accordions";
import { newsletters } from "./newsletters";

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
