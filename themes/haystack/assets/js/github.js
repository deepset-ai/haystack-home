export const fetchGithubStars = async (githubStarContainers) => {
  // Fetch github stars
  const response = await fetch(
    "https://api.github.com/repos/deepset-ai/haystack",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (response.ok) {
    const data = await response.json();

    // Populate elements with stars
    githubStarContainers.forEach((container) => {
      container.innerHTML = data.stargazers_count;
    });
  }
};

export const fetchTopContributors = async (topContributorsContainer) => {
  // Fetch top contributors
  const response = await fetch(
    "https://api.github.com/repos/deepset-ai/haystack/contributors?per_page=10",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (response.ok) {
    // Create elements on page
    const data = await response.json();
    data.forEach((contributor) => {
      const card = document.createElement("li");
      const image = document.createElement("img");
      const userName = document.createElement("span");
      const contributions = document.createElement("span");

      image.src = contributor.avatar_url;
      userName.innerHTML = contributor.login;
      contributions.innerHTML = `${contributor.contributions} contributions`;

      card.append(image, userName, contributions);
      topContributorsContainer.append(card);
    });
  }
};
