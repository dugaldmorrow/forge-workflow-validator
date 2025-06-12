import { APIResponse } from '@forge/api';

export interface ApiAdaptor {

  /**
   * Makes a request to the Jira API. 
   * @param url - The URL to which the request is made. All parameters within must be URL encoded using encodeURIComponent.
   * @param options - Optional parameters for the request, such as method, headers, body, etc.
   * @returns A promise that resolves to the API response.
   */
  requestJira: (url: string, options?: RequestInit) => Promise<APIResponse>;

}
