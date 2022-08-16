import { useEffect, useState } from 'react';
import * as api from './api';

export const App: React.FC = () => {
  const [users, setUsers] = useState<any>([]);
  useEffect(() => {
    const load = async () => {
      setUsers(await api.listUsers());
    };
    load();
  }, []);

  return (
    <div>
      Hello World -
      {' '}
      {JSON.stringify(users)}
    </div>
  );
};
