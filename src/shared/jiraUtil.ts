import { Issue } from "../types/Issue";
import { IssueLinkInfo } from "../types/IssueLink";

class JiraUtil {

  public extractIssueLinkInfos = (issue: Issue, relatedProjectKey: string): IssueLinkInfo[] => {
    const issueLinkInfos: IssueLinkInfo[] = [];
    if (issue.fields && issue.fields.issuelinks) {
      for (const link of issue.fields.issuelinks) {
        this.maybeAddIssueLinkInfo(link.outwardIssue, issueLinkInfos, relatedProjectKey)
        this.maybeAddIssueLinkInfo(link.inwardIssue, issueLinkInfos, relatedProjectKey)
      }
    }
    return issueLinkInfos;
  }

  private maybeAddIssueLinkInfo = (issueLinkInfo: IssueLinkInfo, issueLinkInfos: IssueLinkInfo[], relatedProjectKey: string) => {
    if (issueLinkInfo && issueLinkInfo.key.startsWith(`${relatedProjectKey}-`)) {
      issueLinkInfos.push(issueLinkInfo);
    }
  }

}
export default new JiraUtil();
