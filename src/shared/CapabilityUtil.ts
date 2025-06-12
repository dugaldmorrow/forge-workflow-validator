import { IssueReference } from "../types/IssueReference";
import { ApiAdaptor } from "./ApiAdaptor";
import { ValidationResult } from "../types/ValidationResult";
import { ValidationResultBuilder } from "./ValidationResultBuilder";
import { fetchIssue, getCurrentUser, getSelfAssessmentData } from "./capabilityDAO";
import { AuthorizationUtil } from "./AuthorizationUtil";
import { Issue } from "../types/Issue";
import { selfAssessmentDoneStatusName } from "./sharedConfig";
import { BackendApiAdaptor } from "./BackendApiAdaptor";

export class CapabilityUtil {

  apiAdaptor: ApiAdaptor;
  backendApiAdaptor: BackendApiAdaptor;
  authorizationUtil: AuthorizationUtil;

  constructor(apiAdaptor: ApiAdaptor, backendApiAdaptor: BackendApiAdaptor) {
    this.apiAdaptor = apiAdaptor;
    this.backendApiAdaptor = backendApiAdaptor;
    this.authorizationUtil = new AuthorizationUtil(apiAdaptor);
  }

  public allowIssueToBeResolved = async (
      issueReference: IssueReference,
      accountId: string): Promise<ValidationResult> => {
    const issue = await fetchIssue(this.apiAdaptor, issueReference.key);
    // console.log(` * issue to be transitioned: ${JSON.stringify(issue, null, 2)}`);
    if (issue) {
      const testIssueValidation = await this.validateTestIssueHavePassed(issue);
      if (testIssueValidation.result) {
        const currentUserValidation = await this.validateCurrentUserCanTransitionIssue(accountId);
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
  
  private validateCurrentUserCanTransitionIssue = async (accountId: string): Promise<ValidationResult> => {
    const currentUser = await getCurrentUser(this.backendApiAdaptor, accountId);
    if (currentUser) {
      const isUserInAllowedList = await this.authorizationUtil.isUserInAllowList(currentUser, { key: currentUser.email });
      if (isUserInAllowedList) {
        return new ValidationResultBuilder()
          .setValidity(true)
          .build();
      } else {
        return new ValidationResultBuilder()
          .setValidity(false)
          .setErrorMessage(`Only certain people are allowed to complete the feature.`)
          .build();
      }
    } else {
      return new ValidationResultBuilder()
        .setValidity(false)
        .setErrorMessage(`Could not fetch user information for accountId ${accountId}.`)
        .build();
    }
  };
  
  private validateTestIssueHavePassed = async (issue: Issue): Promise<ValidationResult> => {
    const selfAssessmentData = await getSelfAssessmentData(this.apiAdaptor, issue.key);
    if (selfAssessmentData) {
      if (selfAssessmentData.selfAssessmentIssueLinkInfos.length > 0) {
        // console.log(`Found self assessment issues: ${JSON.stringify(selfAssessmentData.selfAssessmentIssueLinkInfos)}`);
        for (const selfAssessmentIssueLinkInfo of selfAssessmentData.selfAssessmentIssueLinkInfos) {
          console.log(`Checking the status of self assessment issue ${selfAssessmentIssueLinkInfo.key}: ${selfAssessmentIssueLinkInfo.fields.status.name}`);
          if (selfAssessmentIssueLinkInfo.fields.status.name !== selfAssessmentDoneStatusName) {
            return new ValidationResultBuilder()
              .setValidity(false)
              .setErrorMessage(`Self assessment issue ${selfAssessmentIssueLinkInfo.key} is not marked as ${selfAssessmentDoneStatusName}.`)
              .build();
          }
        }
        return new ValidationResultBuilder()
          .setValidity(true)
          .build();
      } else {
        return new ValidationResultBuilder()
          .setValidity(false)
          .setErrorMessage(`Issue ${issue.key} has no linked self assessment issues..`)
          .build();
      }
    } else {
      return new ValidationResultBuilder()
        .setValidity(false)
        .setErrorMessage(`Unable to retrieve self assessment data for issue ${issue.key}.`)
        .build();
    }
  }

}
