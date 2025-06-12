import { UserReference } from "src/types/UserReference";

export default interface BackendDAO {

  getCurrentUser: (accountId: string) => Promise<UserReference | undefined>;

}

