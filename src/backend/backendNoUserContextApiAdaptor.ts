import api, { APIResponse, assumeTrustedRoute } from '@forge/api';
import { ApiAdaptor } from "../shared/ApiAdaptor";

class BackendNoUserContextApiAdaptor implements ApiAdaptor {

  requestJira = (path: string, options?: any): Promise<APIResponse> => {
    return api.asApp().requestJira(assumeTrustedRoute(path), options);
  };

}

export default new BackendNoUserContextApiAdaptor();
