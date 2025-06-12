import api, { APIResponse, assumeTrustedRoute, route } from '@forge/api';
import { BackendApiAdaptor } from 'src/shared/BackendApiAdaptor';
import { UserReference } from 'src/types/UserReference';

class BackendNoUserContextApiAdaptor implements BackendApiAdaptor {

  requestJira = (path: string, options?: any): Promise<APIResponse> => {
    return api.asApp().requestJira(assumeTrustedRoute(path), options);
  };

  getUserReference = async (accountId: string): Promise<UserReference | undefined> => {
    // console.log(`BackendNoUserContextApiAdaptor.getCurrentUser: fetching user for accountId ${accountId}: URL = /rest/api/3/user/email?accountId=${encodeURIComponent(accountId)}`);
    const currentUser = await api.asApp().requestJira(route`/rest/api/3/user/email?accountId=${accountId}`);
    if (currentUser.ok) {
      const user = await currentUser.json() as UserReference;
      // console.log(`Current user: ${JSON.stringify(user, null, 2)}`);
      if (user && user.email) {
        return user;
      }
    } else {
      console.error(`featureReadinessDAO.getCurrentUser: failed to get record for accountId ${accountId}. Response: ${currentUser.status} ${currentUser.statusText}`);
      // TODO: handle error properly.
      return undefined;
    }
  }


}

export default new BackendNoUserContextApiAdaptor();
