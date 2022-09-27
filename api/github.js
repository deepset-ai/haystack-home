// Fetches star count, contributor count and top contributors from the Github API
import axios from "axios";
import parse from "parse-link-header";

const options = {
  headers: { Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}` },
};

export default async function handler(request, response) {
  try {
    // Fetch the data
    const [starsData, totalContributorsData, topContributorsData] =
      await Promise.all([
        // Stars
        axios.get("https://api.github.com/repos/deepset-ai/haystack", options),

        // Total contributors
        axios.get(
          "https://api.github.com/repos/deepset-ai/haystack/contributors?per_page=1",
          options
        ),

        // Top 10 contributors
        axios.get(
          "https://api.github.com/repos/deepset-ai/haystack/contributors?per_page=10",
          options
        ),
      ]);

    const stars = starsData.data.stargazers_count;
    const parsed = parse(totalContributorsData.headers.link); // parse link header to get total pages
    const contributors = parsed.last.page;
    const topContributors = topContributorsData.data.map((contrib) => ({
      name: contrib.login,
      image: contrib.avatar_url,
      contributions: contrib.contributions,
    }));

    response.setHeader(
      "Cache-Control",
      "s-maxage=1800, stale-while-revalidate=1800"
    );

    return response.status(200).json({
      stars,
      contributors,
      top_contributors: topContributors,
    });
  } catch (e) {
    return response.status(500).json({ message: e.message });
  }
}
