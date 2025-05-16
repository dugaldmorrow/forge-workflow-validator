import api, { route } from "@forge/api";
import { complianceFieldId } from "./config";
import { IssueReference } from "./types/IssueReference";
import { fetchTestCaseStatsByIssue, fetchTestCaseStatsByIssueKey } from "./fetchTestCaseStats";
import { fetchUsersAuthorizedToCompleteFeature } from "./authorizationUtil";
import { TestCaseStats } from "./types/TestCaseStats";
import { UserReference } from "./types/UserReference";
import { IssueLinkInfo } from "./types/IssueLink";
import { fetchIssue } from "./fetchIssue";
import { Issue } from "./types/Issue";
import { fetchTestCases } from "./fetchTestCases";
import { PanelType } from "./types/PanelType";

export const updateComplianceField = async (issueReference: IssueReference): Promise<void> => {
  // Docs: https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-issueidorkey-put
  console.log(`Updating the compliance field for issue ${issueReference.key}...`);
  const issueKey = issueReference.key;
  const issue = await fetchIssue(issueKey);
  const stats = await fetchTestCaseStatsByIssue(issue);
  const users = await fetchUsersAuthorizedToCompleteFeature(issueReference);
  const complianceValue = buildComplianceAdf(issue, stats, users);
  const response = await api.asApp().requestJira(route`/rest/api/3/issue/${issueKey}`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fields: {
        [complianceFieldId]: complianceValue,
      },
    }),
  });
  console.log(`Compliance field update successfiul? ${response.ok}`);
  if (!response.ok) {
    throw new Error(`Failed to update compliance field: ${response.statusText}`);
  }
};

const buildComplianceAdf = (issue: Issue, stats: TestCaseStats, users: UserReference[]): any => {
  let utiliseExpands = true;
  const featureTestIssues = fetchTestCases(issue);
  const unsatisfiedFeatureTestIssues: IssueLinkInfo[] = featureTestIssues.filter((issueLink: IssueLinkInfo) => {
    console.log(`Checking the status of issue ${issueLink.key}: ${issueLink.fields.status.name}`);
    return issueLink.fields.status.name !== 'Pass';
  });
  const panelType: PanelType = unsatisfiedFeatureTestIssues.length > 0 ? "error" : "success";
  const mainMessageNodes: any[] = [];
  if (unsatisfiedFeatureTestIssues.length > 0) {
    mainMessageNodes.push(buildParagraphNodeAdf(`You are not able to complete this feature - see below for authorization details.`));
  } else {
    mainMessageNodes.push(buildParagraphNodeAdf(`You are able to complete this feature.`));
  }
  const mainContentNodes: any[] = [];
  if (utiliseExpands) {
    const mainMessagePanel = buildPanelAdf(panelType, mainMessageNodes);
    mainContentNodes.push(mainMessagePanel);
  } else {
    mainContentNodes.push(...mainMessageNodes);
  }
  mainContentNodes.push(buildHeadingNodeAdf(6, "Authorized users"));
  mainContentNodes.push(buildParagraphNodeAdf(`Users who can complete this feature`));
  if (utiliseExpands) {
    // Can't have an expand within a panel:
    mainContentNodes.push(buildExpandAdf("Authorized users", [buildUsersListAdf(users)]));    
  } else {
    mainContentNodes.push(buildUsersListAdf(users));
  }
  mainContentNodes.push(buildHeadingNodeAdf(6, "Test case stats"));
  if (utiliseExpands) {
    // Can't have an expand within a panel:
    mainContentNodes.push(buildExpandAdf("Test case stats", [buildStatsListAdf(stats)]));
  } else {
    mainContentNodes.push(buildStatsListAdf(stats));
  }
  const mainContentNodesPanel = buildPanelAdf(panelType, mainContentNodes);
  const adf = utiliseExpands ? buildAdf(mainContentNodes) : buildAdf([mainContentNodesPanel]);
  // console.log(`ADF = ${JSON.stringify(adf, null, 2)}`);
  return adf;
}

const buildPanelAdf = (panelType: PanelType, content: any[]): any => {
  return {
    type: "panel",
    attrs: {
      panelType: panelType,
    },
    content: content
  }
}

// const buildComplianceAdf = (issue: Issue, stats: TestCaseStats, users: UserReference[]): any => {
//   let showInPanel = true;
//   const featureTestIssues = fetchTestCases(issue);
//   const unsatisfiedFeatureTestIssues: IssueLinkInfo[] = featureTestIssues.filter((issueLink: IssueLinkInfo) => {
//     console.log(`Checking the status of issue ${issueLink.key}: ${issueLink.fields.status.name}`);
//     return issueLink.fields.status.name !== 'Pass';
//   });
//   const panelNodes: any[] = [];
//   if (unsatisfiedFeatureTestIssues.length > 0) {
//     panelNodes.push(buildParagraphNodeAdf(`You are not able to complete this feature.`));
//   } else {
//     panelNodes.push(buildParagraphNodeAdf(`You are able to complete this feature.`));
//   }
//   panelNodes.push(buildHeadingNodeAdf(4, "Authorized users"));
//   panelNodes.push(buildParagraphNodeAdf(`Users who can complete this feature`));
//   if (showInPanel) {
//     panelNodes.push(buildUsersListAdf(users));
//   } else {
//     // Can't have an expand within a panel:
//     panelNodes.push(buildExpandAdf("Authorized users", [buildUsersListAdf(users)]));    
//   }
//   panelNodes.push(buildHeadingNodeAdf(4, "Test case stats"));
//   if (showInPanel) {
//     panelNodes.push(buildStatsListAdf(stats))
//   } else {
//     // Can't have an expand within a panel:
//     panelNodes.push(buildExpandAdf("Test case stats", [buildStatsListAdf(stats)]));
//   }
//   const panel = {
//     type: "panel",
//     attrs: {
//       panelType: unsatisfiedFeatureTestIssues.length > 0 ? "error" : "success",
//     },
//     content: panelNodes
//   }
//   const adf = showInPanel ? buildAdf([panel]) : buildAdf(panelNodes);
//   // console.log(`ADF = ${JSON.stringify(adf, null, 2)}`);
//   return adf;
// }

// ADF docs: https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/

const buildAdf = (content: any[]): any => {
  return {
    version: 1,
    type: "doc",
    content: content
  }
}

const buildExpandAdf = (title: string, content: any[]): any => {
  return {
    type: "expand",
    attrs: {
      title: title
    },
    content: content
  };
}

const buildParagraphNodeAdf = (text: string): any => {
  return {
    type: "paragraph",
    content: [
      {
        type: "text",
        text: text
      }
    ]
  }
}

const buildHeadingNodeAdf = (level: number, text: string): any => {
  return {
    type: "heading",
    attrs: {
      level: level
    },
    content: [
      {
        type: "text",
        text: text
      }
    ]
  }
}

const buildListItemNodeAdf = (text: string): any => {
  return {
    type: "listItem",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: `${text}`
          }
        ]
      }
    ]
  }
}

const buildUsersListAdf = (users: UserReference[]): any => {
  const listItems: any[] = [];
  users.forEach((user) => {
    const userNode = buildListItemNodeAdf(`${user.name} (${user.email})`);
    listItems.push(userNode);
  });
  // listItems.push(buildListItemNodeAdf(`Anyone from Atlassian (*@atlassian.com)`));
  return {
    type: 'bulletList',
    content: listItems
  };
}

const buildStatsListAdf = (stats: TestCaseStats): any => {
  const listItems: any[] = [];
  Object.entries(stats).forEach(([status, count]) => {
    const statusNode = buildListItemNodeAdf(`${status}: ${count}`);
    listItems.push(statusNode);
  });
  return {
    type: 'bulletList',
    content: listItems
  };
}
