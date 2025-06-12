import { APIResponse } from '@forge/api';
import { invoke } from '@forge/bridge';
import { BackendApiAdaptor } from 'src/shared/BackendApiAdaptor';
import { UserReference } from 'src/types/UserReference';

class ResolverDelegatingApiAdaptor implements BackendApiAdaptor {

  getUserReference = (accountId: string): Promise<UserReference | undefined> => {
    console.log(`ResolverDelegatingApiAdaptor.getUserReference: fetching user for accountId ${accountId}`);
    return invoke('getUserReference', { accountId });
  };

}

export default new ResolverDelegatingApiAdaptor();
