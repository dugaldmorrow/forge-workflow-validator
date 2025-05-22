import { fetch } from '@forge/api';
import { featureProjectKey } from "./config";
import { fetchIssue } from "./fetchIssue";
import { IssueLinkInfo } from "./types/IssueLink";
import { updateComplianceField } from "./updateComplianceField";

// https://developer.atlassian.com/platform/forge/events-reference/scheduled-trigger/
// https://developer.atlassian.com/platform/forge/manifest-reference/modules/scheduled-trigger/
export const onFetchDfdsData = async ({ context }) => {
  console.log(`In trigger.onFetchDfdsData:`);
  // console.log(`event: ${JSON.stringify(event, null, 2)}`);
  console.log(`context: ${JSON.stringify(context, null, 2)}`);

  // https://developer.atlassian.com/platform/forge/runtime-reference/fetch-api.basic/
  const dfdsResponse = await fetch("https://dfds-mock.glitch.me/getRecord");
  if ((dfdsResponse).ok) {
    const dfdsData = await dfdsResponse.json();
    console.log(`DFDS data fetched successfully: ${JSON.stringify(dfdsData, null, 2)}`);
  } else {
    const responseText = await dfdsResponse.text();
    console.error(`Error fetching DFDS data: ${dfdsResponse.status}: ${responseText}`);
  }
}

export const onIssueChanged = async (event: any, context: any) => {
  console.log(`In trigger.onIssueChanged:`);
  console.log(`event: ${JSON.stringify(event, null, 2)}`);
  console.log(`context: ${JSON.stringify(context, null, 2)}`);
  const featureTestIssueKey = event.issue.key;
  console.log(`Issue Key: ${featureTestIssueKey}`);

  // const issueReference = { key: featureTestIssueKey };

  const featureTestIssue = await fetchIssue(featureTestIssueKey);
  if (featureTestIssue) {
    // const featureIssueLinkInfos: IssueLinkInfo[] = [];
    const featureIssueLinkInfos = new Set<IssueLinkInfo>();
    if (featureTestIssue.fields.issuelinks) {
      for (const issueLink of featureTestIssue.fields.issuelinks) {
        if (issueLink.inwardIssue && issueLink.inwardIssue.key.startsWith(`${featureProjectKey}-`)) {
          featureIssueLinkInfos.add(issueLink.inwardIssue);
        } else if (issueLink.outwardIssue && issueLink.outwardIssue.key.startsWith(`${featureProjectKey}-`)) {
          featureIssueLinkInfos.add(issueLink.outwardIssue);
        }
      }
    }
    console.log(`Feature Issue Link Infos: ${JSON.stringify(featureIssueLinkInfos, null, 2)}`);
    await updateComplianceFields(featureIssueLinkInfos);
  } else {
    console.error(`Error fetching issue ${featureTestIssueKey}. Check it still exists.`);
  }

}

const updateComplianceFields = async (featureIssueLinkInfos: Set<IssueLinkInfo>): Promise<void> => {


  // TODO: change this to use async tasks


  const updatePromises: Promise<void>[] = [];
  for (const featureIssueLinkInfo of featureIssueLinkInfos) {
    const updatePromise = updateComplianceField(featureIssueLinkInfo);
    updatePromises.push(updatePromise);
  }
  await Promise.all(updatePromises);
}
