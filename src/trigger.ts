import { featureProjectKey } from "./config";
import { fetchIssue } from "./fetchIssue";
import { IssueLinkInfo } from "./types/IssueLink";
import { updateComplianceField } from "./updateComplianceField";

export const onIssueChanged = async (event: any, request: any) => {
  console.log(`In trigger.onIssueChanged:: ${JSON.stringify(request, null, 2)}`);
  // console.log(`context: ${JSON.stringify(context, null, 2)}`);
  // console.log(`event: ${JSON.stringify(event, null, 2)}`);
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
