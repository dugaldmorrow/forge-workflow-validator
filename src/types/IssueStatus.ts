
export interface IssueStatus {
  name: string;
  id: string;
  description: string;
  iconUrl: string;
  self: string;
  statusCategory: {
    id: number;
    key: string;
    name: string;
    colorName: string;
  };
}
