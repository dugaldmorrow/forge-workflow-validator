import { IssueLink } from './IssueLink';
import {IssueStatus} from './IssueStatus';
import {IssueType} from './IssueType';

export interface IssueFields {
  summary: string;
  description: string;
  issuetype: IssueType;
  status: IssueStatus;
  issuelinks?: IssueLink[];
  assignee: any;
  labels?: string[];
}
