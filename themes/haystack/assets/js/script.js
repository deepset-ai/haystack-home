import { fetchGithubStars, fetchTopContributors } from "./github";

// Github stars
// Fetch stars from the Github API and populate containers
const githubStarContainers = document.querySelectorAll(".github-stars-js");
if (githubStarContainers.length > 0) {
  fetchGithubStars(githubStarContainers);
}

// Top contributors
const topContributorsContainer = document.querySelector(
  ".top-contributors-container-js"
);
if (topContributorsContainer) {
  fetchTopContributors(topContributorsContainer);
}
