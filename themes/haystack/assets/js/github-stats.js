import { kFormatter } from "./utils";

// Fetches github data from api and populates html with stars and contributors
export const githubStats = async () => {
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
    const response = await fetch("/api/github", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();

      // Populate stars
      if (starContainers.length > 0) {
        starContainers.forEach((container) => {
          container.innerHTML = kFormatter(data.stars);
        });
      }

      // Populate contributors
      if (contributorsContainers.length > 0) {
        contributorsContainers.forEach((container) => {
          container.innerHTML = data.contributors;
        });
      }

      // Populate top contributors
      if (topContributorsContainer) {
        topContributorsContainer.innerHTML = "";
        data.top_contributors.forEach((contributor) => {
          const card = document.createElement("li");
          const image = document.createElement("img");
          const userName = document.createElement("span");
          const contributions = document.createElement("span");

          image.src = contributor.image;
          image.alt = contributor.name;
          userName.innerHTML = contributor.name;
          contributions.innerHTML = `${contributor.contributions} contributions`;

          card.append(image, userName, contributions);
          topContributorsContainer.append(card);
        });
      }
    }
  }
};
