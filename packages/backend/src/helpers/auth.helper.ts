export interface RequestWithUser {
  user: {
    username: string;
    groups: string[];
  };
}
