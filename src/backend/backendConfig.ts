
// This configuration constants in this file are for the backend only because they 
// are dependent on environment variables and environment variable can only be
// accessed in the backend code.
// For configuration constants that are not dependent on environment variables,
// see sharedConfig.ts.


// TODO: The following constants need to be set using environment variables.

/**
 * Returns something like 3.
 * This must be configured as an environment variable as follows:
 * > forge variables set IN_PROGRESS_WORKFLOW_STATE_ID xxxxxx
 * > forge variables set --environment production IN_PROGRESS_WORKFLOW_STATE_ID xxxxxx
 * > export FORGE_USER_VAR_IN_PROGRESS_WORKFLOW_STATE_ID=xxxxxx
 * See https://developer.atlassian.com/platform/forge/environments-and-versions/.
 */
export const getInProgressWorkflowStateId = (): string => {
  const inProgressWorkflowStateId = process.env.IN_PROGRESS_WORKFLOW_STATE_ID;
  if (inProgressWorkflowStateId === undefined) {
    throw new Error(`The environment variable IN_PROGRESS_WORKFLOW_STATE_ID is not defined. Please see the explanation in backendConfig.ts.`);
  }
  return inProgressWorkflowStateId;
}

/**
 * Returns something like 5.
 * This must be configured as an environment variable as follows:
 * > forge variables set RESOLVED_WORKFLOW_STATE_ID xxxxxx
 * > forge variables set --environment production RESOLVED_WORKFLOW_STATE_ID xxxxxx
 * > export FORGE_USER_VAR_RESOLVED_WORKFLOW_STATE_ID=xxxxxx
 * See https://developer.atlassian.com/platform/forge/environments-and-versions/.
 */
export const getResolvedWorkflowStateId = (): string => {
  const resolvedWorkflowStateId = process.env.RESOLVED_WORKFLOW_STATE_ID;
  if (resolvedWorkflowStateId === undefined) {
    throw new Error(`The environment variable RESOLVED_WORKFLOW_STATE_ID is not defined. Please see the explanation in backendConfig.ts.`);
  }
  return resolvedWorkflowStateId;
}

/**

Example commands to set these variables for the development environment:

export FORGE_USER_VAR_IN_PROGRESS_WORKFLOW_STATE_ID=3
export FORGE_USER_VAR_RESOLVED_WORKFLOW_STATE_ID=5

forge variables set --environment development IN_PROGRESS_WORKFLOW_STATE_ID 3
forge variables set --environment development RESOLVED_WORKFLOW_STATE_ID 5


*/

