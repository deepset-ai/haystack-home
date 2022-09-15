import { fetchGithubData } from "./github-stats";
import { newsletter } from "./newsletter";

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
