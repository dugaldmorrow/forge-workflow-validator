import { IssueReference } from "./types/IssueReference";
import { UserReference } from "./types/UserReference";

export const isUserInAllowList = async (userToCheck: UserReference, issueReference: IssueReference): Promise<boolean> => {
  const allowed = await fetchUsersAuthorizedToCompleteFeature(issueReference);
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

export const fetchUsersAuthorizedToCompleteFeature = async (issueReference: IssueReference): Promise<UserReference[]> => {

  // This is a stub implementation. Replace with actual logic to fetch users authorized to complete the feature.

  const users: UserReference[] = [{
    name: 'Foo',
    email: "foo@acme.com",
  }, {
    name: 'Bar',
    email: "bar@acme.com",
  }, {
    name: 'Anyone from Atlassian',
    email: "*@atlassian.com",
  }]
  return users;
}

