import { IssueTransition } from "../types/IssueTransition";
import { ValidationResult } from "../types/ValidationResult";
import { ValidationResultBuilder } from "../shared/ValidationResultBuilder";
import backendNoUserContextApiAdaptor from "./backendNoUserContextApiAdaptor";
import { CapabilityUtil } from "../shared/CapabilityUtil";
import { getInProgressWorkflowStateId, getResolvedWorkflowStateId } from "./backendConfig";

/**
 * The Forge platform invokes this function when a user attempts to transition an issue. See the jira:workflowValidator module
 * and associated function in the manifest.yml file.
 */
export const checkFeatureCompletion = async (issueTransition: IssueTransition): Promise<ValidationResult> => {
  const issueReference = issueTransition.issue;
  const transition = issueTransition.transition;
  const { from, to } = transition; // Destructure from transition
  // console.log(`In checkFeatureCompletion: ${issueReference.key} from ${from.id} to ${to.id}`); // Use issueReference instead of issue
  // console.log(` * from: ${JSON.stringify(from)}`);
  // console.log(` * to: ${JSON.stringify(to)}`);
  // console.log(` * issueTransition: ${JSON.stringify(issueTransition, null, 2)}`);

  const inProgressWorkflowStateId = getInProgressWorkflowStateId();
  const resolvedWorkflowStateId = getResolvedWorkflowStateId();

  const isTransitionFromInProgressToResolved = from.id === inProgressWorkflowStateId && to.id === resolvedWorkflowStateId; 
  if (isTransitionFromInProgressToResolved) {
    const capabilityUtil = new CapabilityUtil(backendNoUserContextApiAdaptor, backendNoUserContextApiAdaptor);
    const result = await capabilityUtil.allowIssueToBeResolved(issueReference, issueTransition.user.accountId);
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
