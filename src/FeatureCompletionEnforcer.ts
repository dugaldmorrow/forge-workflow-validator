import api, { route } from "@forge/api";
import { IssueTransition } from "./types/IssueTransition";
import { ValidationResult } from "./types/ValidationResult";
import { Issue } from "./types/Issue";
import { IssueLinkInfo } from "./types/IssueLink";
import { ValidationResultBuilder } from "./ValidationResultBuilder";
import { IssueReference } from "./types/IssueReference";
import { isUserInAllowList } from "./authorizationUtil";
import { fetchTestCases } from "./fetchTestCases";
import { fetchIssue } from "./fetchIssue";
import { inProgressWorkflowStateId, resolvedWorkflowStateId } from "./config";

/**
 * The Forge platform invokes this function when a user attempts to transition an issue. See the jira:workflowValidator module
 * and associated function in the manifest.yml file.
 */
export const checkFeatureCompletion = async (issueTransition: IssueTransition): Promise<ValidationResult> => {
  const issueReference = issueTransition.issue;
  const transition = issueTransition.transition;
  const { from, to } = transition; // Destructure from transition
  console.log(`In checkFeatureCompletion: ${issueReference.key} from ${from.id} to ${to.id}`); // Use issueReference instead of issue
  console.log(` * from: ${JSON.stringify(from)}`);
  console.log(` * to: ${JSON.stringify(to)}`);
  // console.log(` * issueTransition: ${JSON.stringify(issueTransition, null, 2)}`);

  const isTransitionFromInProgressToResolved = from.id === inProgressWorkflowStateId && to.id === resolvedWorkflowStateId; 
  if (isTransitionFromInProgressToResolved) {
    const result = await allowIssueToBeResolved(issueReference, issueTransition.user.accountId);
    if (!result.result) {
      const messageToAppend = `Expand the Completion requirements issue panel for details.`
      result.errorMessage = `${result.errorMessage ?? ''} ${messageToAppend}`.trim();
    }
    return result;
  } else {
    return new ValidationResultBuilder()
      .setValidity(true)
      .build();
  }
}

export const allowIssueToBeResolved = async (
    issueReference: IssueReference,
    accountId: string): Promise<ValidationResult> => {
  const issue = await fetchIssue(issueReference.key);
  if (issue) {
    const testIssueValidation = validateTestIssueHavePassed(issue);
    if (testIssueValidation.result) {
      const currentUserValidation = await validateCurrentUserCanTransitionIssue(accountId);
      return currentUserValidation;
    } else {
      return testIssueValidation;
    }
  } else {
    console.error(`Error fetching issue ${issueReference.key}. Check it still exists.`);
    return new ValidationResultBuilder()
      .setValidity(false)
      .setErrorMessage(`Error fetching issue ${issueReference.key}. Check it still exists.`)
      .build();
  }
};

const validateCurrentUserCanTransitionIssue = async (accountId: string): Promise<ValidationResult> => {
  const currentUser = await api.asApp().requestJira(route`/rest/api/3/user/email?accountId=${accountId}`);
  if (currentUser.ok) {
    const user = await currentUser.json();
    console.log(`Current user: ${JSON.stringify(user, null, 2)}`);
    if (user && user.email) {
      const isUserInAllowedList = await isUserInAllowList(user, { key: user.email });
      if (isUserInAllowedList) {
        return new ValidationResultBuilder()
          .setValidity(true)
          .build();
      } else {
        return new ValidationResultBuilder()
          .setValidity(false)
          // .setErrorMessage(`Only ${allowed.map(u => u.email).join(", ")} are allowed to transition this issue.`)
          .setErrorMessage(`Only certain people are allowed to complete the feature.`)
          .build();
      }
    } else {
      return new ValidationResultBuilder()
        .setValidity(false)
        .setErrorMessage(`Could not fetch user information for accountId ${accountId}.`)
        .build();
    }
  } else {
    return new ValidationResultBuilder()
      .setValidity(false)
      .setErrorMessage(`Could not fetch user information for accountId ${accountId}.`)
      .build();
  }
};

const validateTestIssueHavePassed = (issue: Issue): ValidationResult => {
  const featureTestIssues = fetchTestCases(issue);
  if (featureTestIssues.length ===  0) {
    return new ValidationResultBuilder()
      .setValidity(false)
      .setErrorMessage(`Issue ${issue.key} has no linked feature test issues.`)
      .build();
   } else {
     console.log(`Found related feature test issues: ${JSON.stringify(featureTestIssues)}`);
     const unsatisfiedFeatureTestIssueCount = featureTestIssues.filter((issueLink: IssueLinkInfo) => {
        console.log(`Checking the status of issue ${issueLink.key}: ${issueLink.fields.status.name}`);
        return issueLink.fields.status.name !== 'Pass';
     });
     console.log(` * unsatisfiedFeatureTestIssueCount.length = ${unsatisfiedFeatureTestIssueCount.length}`);
     if (unsatisfiedFeatureTestIssueCount.length > 0) {
       return new ValidationResultBuilder()
         .setValidity(false)
         .setErrorMessage(`No feature test issues are marked as Done for issue ${issue.key}.`)
         .build();
     } else {
        return new ValidationResultBuilder()
         .setValidity(true)
         .build();
     }
   }
}
