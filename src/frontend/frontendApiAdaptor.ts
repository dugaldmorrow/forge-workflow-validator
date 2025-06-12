import { APIResponse, Route } from '@forge/api';
import { requestJira } from '@forge/bridge';
import { ApiAdaptor } from "../shared/ApiAdaptor";

class FrontendApiAdaptor implements ApiAdaptor {

  requestJira = (path: string, options?: any): Promise<APIResponse> => {
    return requestJira(path, options);
  };

}

export default new FrontendApiAdaptor();
