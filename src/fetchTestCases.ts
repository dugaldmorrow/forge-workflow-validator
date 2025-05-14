import { featureProjectKey, featureTestProjectKey } from "./config";
import { Issue } from "./types/Issue";
import { IssueLinkInfo } from "./types/IssueLink";

export const fetchTestCases = (featureIssue: Issue): IssueLinkInfo[] => {

  // This method fetches the test cases related to a feature issue using the assumption that the test 
  // cases are linked from the feature issue.

  if (!featureIssue.key.startsWith(`${featureProjectKey}-`)) {
    throw new Error(`Invalid issue key: ${featureIssue.key}. Expected to start with ${featureProjectKey}-`);
  }

  const issueLinks: IssueLinkInfo[] = [];
  if (featureIssue.fields.issuelinks) {
    for (const issueLink of featureIssue.fields.issuelinks) {
      if (issueLink.inwardIssue && issueLink.inwardIssue.key.startsWith(`${featureTestProjectKey}-`)) {
        issueLinks.push(issueLink.inwardIssue);
      } else if (issueLink.outwardIssue && issueLink.outwardIssue.key.startsWith(`${featureTestProjectKey}-`)) {
        issueLinks.push(issueLink.outwardIssue);
      }
    }
  }
  return issueLinks;
}
