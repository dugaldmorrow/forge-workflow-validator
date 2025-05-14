import {IssueFields} from './IssueFields';

export interface Issue {
  key: string;
  fields: IssueFields;
  renderedFields: IssueFields;
}
