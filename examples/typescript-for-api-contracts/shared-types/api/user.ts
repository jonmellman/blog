export type User = {
  userId: number,
  name: string
};

export type GetUsersApi = {
  PathParams: never
  ResponseBody: User[]
  RequestBody: never
  QueryParams: never
};
