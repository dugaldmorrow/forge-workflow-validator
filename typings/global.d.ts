type Fetch = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

interface ProductFetch {
  requestConfluence: Fetch;
  requestJira: Fetch;
}

interface XenAPI extends ProductFetch {
  fetch: Fetch;
  asApp: () => ProductFetch;
  /**
   * @deprecated Please use api.asApp()
   */
  asAppUser: () => { fetch: Fetch };
  /**
   * @deprecated Please use api.asUser()
   */
  asRequestUser: () => { fetch: Fetch };
  asUser: () => ProductFetch;
}

declare var api: XenAPI;
