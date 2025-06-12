import { Issue } from "./Issue";
import { IssueLinkInfo } from "./IssueLink";

export type SelfAssessmentData = {
  capabilityIssue: Issue;
  selfAssessmentIssueLinkInfos: IssueLinkInfo[];
}
