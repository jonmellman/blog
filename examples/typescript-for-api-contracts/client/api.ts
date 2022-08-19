import axios from 'axios';
import { GetUsersApi, User } from '../shared-types/api/user';

export const getUsers = async (): Promise<User[]> => {
  const { data } = await axios.get<GetUsersApi['ResponseBody']>('/api/users');
  return data;
};
