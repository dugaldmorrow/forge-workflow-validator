import { UserReference } from "src/types/UserReference";
import { ApiAdaptor } from "./ApiAdaptor";

export interface BackendApiAdaptor {

  getUserReference: (accountId: string) => Promise<UserReference | undefined>;

}
