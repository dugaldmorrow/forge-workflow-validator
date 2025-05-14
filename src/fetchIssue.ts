import api, { route } from "@forge/api";
import { Issue } from "./types/Issue";

export const fetchIssue = async (issueKey: string): Promise<Issue> => {
  const issueResponse = await api.asApp().requestJira(route`/rest/api/3/issue/${issueKey}`, {
    headers: {
      'Accept': 'application/json'
    }
  });
  if (issueResponse.ok) {
    const issue = await issueResponse.json();
    return issue;
  } else {
    const text = await issueResponse.text();
    console.error(`Error fetching issue ${issueKey}: ${issueResponse.status} ${issueResponse.statusText}: ${text}`);
    return undefined;
  }

}
