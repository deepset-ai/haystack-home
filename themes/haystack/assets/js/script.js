import { fetchGithubData } from "./github";

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
