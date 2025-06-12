import { UserReference } from "src/types/UserReference";
import { ApiAdaptor } from "./ApiAdaptor";
import { IssueReference } from "../types/IssueReference";
import { getCapabilityWorkItemByIssueKey } from "./capabilityDAO";

export class AuthorizationUtil {

  apiAdaptor: ApiAdaptor;

  constructor(apiAdaptor: ApiAdaptor) {
    this.apiAdaptor = apiAdaptor;
  }

  public isUserInAllowList = async (userToCheck: UserReference, issueReference: IssueReference): Promise<boolean> => {
    const allowed = await this.fetchUsersAuthorizedToCompleteFeature(issueReference);
    const exactEmailMatch = allowed.some(user => user.email === userToCheck.email);
    if (exactEmailMatch) {
      return true;
    } else {
      const userEmailDomain = userToCheck.email.split('@')[1];
      const wildcardEmailMatch = allowed.some(user => {
        const emailParts = user.email.split('@');
        if (emailParts.length === 2 && emailParts[0] === '*') {
          const domain = emailParts[1];
          if (domain === userEmailDomain) {
            return true;
          }
        }
        return false;
      });
      return wildcardEmailMatch;
    }
  }
  
  private fetchUsersAuthorizedToCompleteFeature = async (issueReference: IssueReference): Promise<UserReference[]> => {
    const capabilityWorkItem = await getCapabilityWorkItemByIssueKey(issueReference.key);
    if (capabilityWorkItem) {
      // example of planOwners: "Business Lead: Derrick.Ives2@T-Mobile.com;Tech Lead: John.Dougherty7@T-Mobile.com;Tech Lead: Chandrika.Adhikesavalu1@T-Mobile.com;Tech Lead: Cameron.Brauer@T-Mobile.com;Tech Lead: Urel.Djiogan1@T-Mobile.com;Tech Lead: Akshay.Dhagat1@T-Mobile.com;Tech Lead: Alex.Nguyen33@T-Mobile.com"
      const nameEmailPairs = capabilityWorkItem.strategic_plan_owners.split(';'); // e.g. ["Business Lead: Derrick.Ives2@T-Mobile.com", "Tech Lead: John.Dougherty7@T-Mobile.com", ...]
      const rawPlanOwners = nameEmailPairs.map(pair => {
        const parts = pair.split(':');
        if (parts.length === 2) {
          const name = parts[0].trim(); // e.g. "Business Lead"
          const email = parts[1].trim(); // e.g. "Derrick.Ives2@T-Mobile.com"
          const userReference: UserReference = {
            name: name,
            email: email,
          }
          return userReference;
        } else {
          console.error(`AuthorizationUtil.fetchUsersAuthorizedToCompleteFeature: Invalid format for plan owner pair: ${pair}`);
          return undefined;
        }
      });
      const planOwners = rawPlanOwners.filter(owner => owner !== undefined) as UserReference[]; // Filter out any undefined values
      return planOwners;
    } else {
      console.error(`AuthorizationUtil.fetchUsersAuthorizedToCompleteFeature: failed to get record for issue ${issueReference.key}.`);
      return [];
    }
  }
  
  

}
