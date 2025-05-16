import Resolver from '@forge/resolver';
import { allowIssueToBeResolved } from './FeatureCompletionEnforcer';
import { TestCaseStats } from './types/TestCaseStats';
import { fetchUsersAuthorizedToCompleteFeature } from './authorizationUtil';
import { fetchTestCaseStatsByIssueKey } from './fetchTestCaseStats';
import { IssueReference } from './types/IssueReference';

// The following "resolver" functions are invoked from the client-side Forge UI.

const resolver = new Resolver();

resolver.define('getCompletionValidationInfo', async (req) => {
  // console.log(req);
  const issueReference: IssueReference = {
    key: req.context.extension.issue.key,
  };
  const validationResult = await allowIssueToBeResolved(issueReference, req.context.accountId);
  return validationResult;
});

resolver.define('getUsersWhoCanComplete', async (req) => {
  // console.log(req);
  const users = await fetchUsersAuthorizedToCompleteFeature(req.context.extension.issue.key);
  return users;
});

resolver.define('getTestCaseStats', async (req) => {
  // console.log(req);
  const stats: TestCaseStats = await fetchTestCaseStatsByIssueKey(req.context.extension.issue.key);
  return stats;
});

export const handler = resolver.getDefinitions();
