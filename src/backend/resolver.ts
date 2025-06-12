import Resolver from '@forge/resolver';
import backendNoUserContextApiAdaptor from './backendNoUserContextApiAdaptor';

const resolver = new Resolver();

// The /rest/api/3/user/email?accountId={accountId} API can only be called by the app (api.asApp()) so
// the call must be made from the backend.
resolver.define('getUserReference', async (req) => {
  console.log(`Resolver.getUserReference: ${JSON.stringify(req, null, 2)}`);
  const payload = req.payload;
  const accountId = payload.accountId;
  return await backendNoUserContextApiAdaptor.getUserReference(accountId);
});

export const handler = resolver.getDefinitions();
