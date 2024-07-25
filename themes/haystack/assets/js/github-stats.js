import { kFormatter } from "./utils";

// Fetches github data from api and populates html with stars and contributors
export const githubStats = async () => {
  const starContainers = document.querySelectorAll(".github-stars-js");
  const contributorContainers = document.querySelectorAll(
    ".github-contributors-js"
  );

  if ([...starContainers, ...contributorContainers].length > 0) {
    const response = await fetch("/api/github-stats", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();

      // Populate stars
      starContainers.forEach((container) => {
        container.innerHTML = kFormatter(data.stars);
      });

      // Populate contributors
      contributorContainers.forEach((container) => {
        container.innerHTML = data.contributors;
      });
    }
  }
};
