import { IssuePriority } from "./IssuePriority";
import { IssueStatus } from "./IssueStatus";
import { IssueType } from "./IssueType";

export type IssueLinkInfo = {
  id: string;
  key: string;
  self: string;
  fields: {
    summary: string;
    status: IssueStatus;
    priority: IssuePriority;
    issueType: IssueType;
  }
}

export type IssueLink = {
  id: string;
  self: string;
  type: {
    id: string;
    name: string;
    inward: string;
    outward: string;
    self: string;
  };
  inwardIssue?: IssueLinkInfo;
  outwardIssue?: IssueLinkInfo;
}
