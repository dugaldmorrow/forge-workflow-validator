import { fetchIssue } from "./fetchIssue";
import { fetchTestCases } from "./fetchTestCases";
import { TestCaseStats } from "./types/TestCaseStats";

export const fetchTestCaseStats = async (issueKey: string): Promise<TestCaseStats> => {
  const stats: TestCaseStats = {
    totalPass: 0,
    totalFailed: 0,
    totalDependent: 0,
    totalBlocked: 0,
    totalToBeReviewed: 0,
    totalIncomplete: 0,
    totalDeferred: 0,
    totalReadyToRun: 0,
    totalUnableToTest: 0,
    totalNa: 0,
    totalOthers: 0,
  }
  const issue = await fetchIssue(issueKey);
  const testCases = fetchTestCases(issue);
  for (const testCase of testCases) {
    if (testCase.fields.status.name === 'Pass') {
      stats.totalPass++;
    } else if (testCase.fields.status.name === 'Fail') {
      stats.totalFailed++;
    } else if (testCase.fields.status.name === 'Blocked') {
      stats.totalBlocked++;
    } else if (testCase.fields.status.name === 'Deferred') {
      stats.totalDeferred++;
    } else if (testCase.fields.status.name === 'To Be Reviewed') {
      stats.totalToBeReviewed++;
    } else if (testCase.fields.status.name === 'Ready To Run') {
      stats.totalReadyToRun++;
    } else if (testCase.fields.status.name === 'Dependent') {
      stats.totalDependent++;
    } else if (testCase.fields.status.name === 'Incomplete') {
      stats.totalIncomplete++;
    } else if (testCase.fields.status.name === 'N/A') {
      stats.totalNa++;
    } else {
      stats.totalOthers++;
    }
  }
  return stats;
}
