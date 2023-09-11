export default async function githubIssues(request, response) {
  if (!process.env.GITHUB_ACCESS_TOKEN) {
    response.status(500).send({ message: "Github access token not set" });
  }

  const repos = ["deepset-ai/trial-repo", "deepset-ai/haystack-home"];

  try {
    const fetchPromises = repos.map(async (repo) => {
      const res = await fetch(
        `https://api.github.com/repos/${repo}/issues?state=all`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            accept: "application/vnd.github+json",
            Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`,
          },
        }
      );
      if (!res.ok) {
        throw new Error(res.status);
      }
      const data = await res.json();
      return data
        .filter((issue) => !issue.pull_request)
        .map((issue) => ({
          repo,
          title: issue.title,
          url: issue.html_url,
          labels: issue.labels,
          state: issue.state,
        }));
    });

    const res = await Promise.all(fetchPromises);
    const issues = res.flat().sort((a, b) => {
      if (a.state === "open" && b.state === "closed") return -1;
      if (a.state === "closed" && b.state === "open") return 1;
      return 0;
    });

    response.status(200).send(issues);
  } catch (error) {
    console.error("Error:", error);
    response.status(500).send({ message: "Error fetching issues" });
  }
}
