import parse from "parse-link-header";

const options = {
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
  },
};

export default async function githubStats(request, response) {
  response.setHeader(
    "Cache-Control",
    "s-maxage=3600, stale-while-revalidate=600"
  );
  
  if (!process.env.GITHUB_ACCESS_TOKEN) {
    response.status(500).send({ message: "Github access token not set" });
  }

  try {
    const [starsRes, contributorsRes] = await Promise.all([
      fetch("https://api.github.com/repos/deepset-ai/haystack", options),
      fetch(
        "https://api.github.com/repos/deepset-ai/haystack/contributors?per_page=1",
        options
      ),
    ]);

    if (!starsRes.ok || !contributorsRes.ok) {
      throw new Error("Failed to fetch data from GitHub");
    }

    const starsData = await starsRes.json();
    const stars = starsData.stargazers_count;
    const contributorsLinkHeader = contributorsRes.headers.get("link");
    const parsed = parse(contributorsLinkHeader); // parse link header to get total pages
    const contributors = parsed.last.page;

    response.status(200).json({ stars, contributors });
  } catch (e) {
    response.status(500).json({ error: e.message });
  }
}
