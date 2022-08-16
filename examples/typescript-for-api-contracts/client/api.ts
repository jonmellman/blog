import axios from 'axios';

export const listUsers = async () => {
  const { data } = await axios.get('/api/users');
  return data;
};
