import { fetchGithubData } from "./github-stats";
import { newsletter } from "./newsletter";
import { Accordion } from "./accordion";

// Newsletters
const newsletterForms = document.querySelectorAll(".js-newsletter-form");
if (newsletterForms.length > 0) {
  newsletter(newsletterForms);
}

// Github stats
const starContainers = document.querySelectorAll(".github-stars-js");
const contributorsContainers = document.querySelectorAll(
  ".github-contributors-js"
);
const topContributorsContainer = document.querySelector(
  ".top-contributors-container-js"
);

if (
  [...starContainers, ...contributorsContainers].length > 0 ||
  topContributorsContainer
) {
  fetchGithubData(
    starContainers,
    contributorsContainers,
    topContributorsContainer
  );
}

document.querySelectorAll(".accordion").forEach((el) => {
  new Accordion(el);
});
