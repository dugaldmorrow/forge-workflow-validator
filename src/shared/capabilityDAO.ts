import { SelfAssessmentData } from "../types/SelfAssessmentData";
import { CapabilityWorkItem } from "../types/CapabilityWorkItem";
import { ApiAdaptor } from "./ApiAdaptor";
import { Issue } from "../types/Issue";
import jiraUtil from "./jiraUtil";
import { selfAssessmentProjectKey } from "./sharedConfig";
import { UserReference } from "../types/UserReference";
import { BackendApiAdaptor } from "./BackendApiAdaptor";

// This file provides functions to retrieve capability data from the DFDS database and Jira issues. The 
// reason the file ends in "DAO" is that it is short for data access object and is a common pattern in software
// development.


// NOTE: The functions in this file can be used in both the frontend (web browser) and backend (Forge functions) of the
//       app. The benefits of this are:
//
//         1. The same code can be used in both the frontend and backend, reducing duplication.
//         2. Calls can be made directly from the frontend instead of needing to go through a resolver (Forge 
//            function which will lead to more responsive UIs).
// 
//       However, this introduces two complications:
//
//         1. The external API response needs to include the CORS header "Access-Control-Allow-Origin: *" so that the
//            API calls can be made from the browser. 
//         2. Forge provides slightly different APIs for making API requests to Jira. This is why the functions 
//            returning Jira data require the ApiAdaptor parameter.

const cachedCapabilityIssueKeysToCapabilityWorkItems: Record<string, CapabilityWorkItem> = {};
const cachedIssueKeysToIssues: Record<string, Issue> = {};
const cachedIssueKeysToSelfAssessmentData: Record<string, SelfAssessmentData> = {};
const cachedAccountIdsToUsers: Record<string, UserReference> = {};

export const getCapabilityWorkItemByIssueKey = async (
  capabilityIssueKey: string
): Promise<CapabilityWorkItem | undefined> => {
  if (!capabilityIssueKey) {
    throw new Error("featureReadinessDAO.getCapabilityWorkItemByIssueKey: issueKey is required.");
  }
  const cachedCapabilityWorkItem = cachedCapabilityIssueKeysToCapabilityWorkItems[capabilityIssueKey];
  if (cachedCapabilityWorkItem) {
    // console.log(`featureReadinessDAO.getCapabilityWorkItemByIssueKey: using cached value for issue ${capabilityIssueKey}`);
    return cachedCapabilityWorkItem;
  }
  // console.log(`featureReadinessDAO.getCapabilityWorkItemByIssueKey: issueKey = ${capabilityIssueKey}`);
  const dfdsMockUrl = `https://dfds-mock.glitch.me/getCapabilityWorkItem/${capabilityIssueKey}`
  // console.log(`featureReadinessDAO.getCapabilityWorkItemByIssueKey: dfdsMockUrl = ${dfdsMockUrl}`);
  const dfdsResponse = await fetch(dfdsMockUrl);
  if (dfdsResponse.ok) {
    const capabilityWorkItem = await dfdsResponse.json() as CapabilityWorkItem;
    cachedCapabilityIssueKeysToCapabilityWorkItems[capabilityIssueKey] = capabilityWorkItem;
    // console.log(`featureReadinessDAO.getCapabilityWorkItemByIssueKey: successfully retrieved record for issue ${capabilityIssueKey}: ${JSON.stringify(capabilityWorkItem, null, 2)}`);
    return capabilityWorkItem;
  } else {
    console.error(`featureReadinessDAO.getCapabilityWorkItemByIssueKey: failed to get record for issue ${capabilityIssueKey}. Response: ${dfdsResponse.status} ${dfdsResponse.statusText}`);
    // TODO: handle error properly.
  }
}

export const fetchIssue = async (apiAdaptor: ApiAdaptor, issueKey: string): Promise<Issue> => {
  const cachedIssue = cachedIssueKeysToIssues[issueKey];
  if (cachedIssue) {
    // console.log(`featureReadinessDAO.fetchIssue: using cached value for issue ${issueKey}`);
    return cachedIssue;
  }
  const issueResponse = await apiAdaptor.requestJira(`/rest/api/3/issue/${encodeURIComponent(issueKey)}`, {
    headers: {
      'Accept': 'application/json'
    }
  });
  if (issueResponse.ok) {
    const issue = await issueResponse.json();
    return issue;
  } else {
    const text = await issueResponse.text();
    console.error(`Error fetching issue ${issueKey}: ${issueResponse.status} ${issueResponse.statusText}: ${text}`);
    return undefined;
  }
}

export const getSelfAssessmentData = async (
  apiAdaptor: ApiAdaptor,
  capabilityIssueKey: string
): Promise<SelfAssessmentData | undefined> => {
  const cachedSelfAssessmentData = cachedIssueKeysToSelfAssessmentData[capabilityIssueKey];
  if (cachedSelfAssessmentData) {
    // console.log(`featureReadinessDAO.getSelfAssessmentData: using cached value for issue ${capabilityIssueKey}`);
    return cachedSelfAssessmentData;
  }

  // Note the query parameter fields=issuelinks to get the issue link data...
  const response = await apiAdaptor.requestJira(`/rest/api/3/issue/${encodeURIComponent(capabilityIssueKey)}?fields=issuelinks`, {
    headers: {
      'Accept': 'application/json'
    }
  });
  if (response.ok) {
    const capabilityIssue = await response.json() as Issue;
    // console.log(`featureReadinessDAO.getCapabilityWorkItemByIssueKey: successfully retrieved record for issue ${capabilityIssueKey}: ${JSON.stringify(capabilityIssue, null, 2)}`);
    const selfAssessmentIssueLinkInfos = jiraUtil.extractIssueLinkInfos(capabilityIssue, selfAssessmentProjectKey);
    const selfAssessmentData: SelfAssessmentData = {
      capabilityIssue: capabilityIssue,
      selfAssessmentIssueLinkInfos: selfAssessmentIssueLinkInfos
    }
    return selfAssessmentData;
  } else {
    console.error(`featureReadinessDAO.getCapabilityWorkItemByIssueKey: failed to get record for issue ${capabilityIssueKey}. Response: ${response.status} ${response.statusText}`);
    // TODO: handle error properly.
    return undefined;
  }
}

export const getCurrentUser = async (
  backendApiAdaptor: BackendApiAdaptor,
  accountId: string
): Promise<UserReference | undefined> => {
  const cachedUser = cachedAccountIdsToUsers[accountId];
  if (cachedUser) {
    // console.log(`featureReadinessDAO.getCurrentUser: using cached value for accountId ${accountId}`);
    return cachedUser;
  }

  const user = await backendApiAdaptor.getUserReference(accountId);
  return user;

  // console.log(`featureReadinessDAO.getCurrentUser: fetching user for accountId ${accountId}: URL = /rest/api/3/user/email?accountId=${encodeURIComponent(accountId)}`);
  // const currentUser = await backendApiAdaptor.requestJira(`/rest/api/3/user/email?accountId=${encodeURIComponent(accountId)}`);
  // if (currentUser.ok) {
  //   const user = await currentUser.json() as UserReference;
  //   console.log(`Current user: ${JSON.stringify(user, null, 2)}`);
  //   if (user && user.email) {
  //     return user;
  //   }
  // } else {
  //   console.error(`featureReadinessDAO.getCurrentUser: failed to get record for accountId ${accountId}. Response: ${currentUser.status} ${currentUser.statusText}`);
  //   // TODO: handle error properly.
  //   return undefined;
  // }
}
