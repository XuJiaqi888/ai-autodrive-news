export interface GithubRepo {
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
}

export async function searchGithubRepos(q: string, perPage = 5): Promise<GithubRepo[]> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = { 'Accept': 'application/vnd.github+json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const params = new URLSearchParams({
    q: `${q} in:name,description,readme sort:stars pushed:>2024-01-01`,
    per_page: String(perPage),
  });
  const res = await fetch(`https://api.github.com/search/repositories?${params.toString()}`, { headers, cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items || []) as GithubRepo[];
}


