import { IssueReference } from "./IssueReference"

export type IssueTransition = {
  issue: IssueReference;
  modifiedFields: {
    [key: string]: any
  };
  context: {
    cloudId: string;
    moduleKey: string;
    userAccess: {
      enabled: boolean;
      hasAccess: boolean;
    }
  },
  user: {
    accountId: string;
  },
  transition: {
    from: {
      id: string;
    },
    to: {
      id: string;
    }
  }
}