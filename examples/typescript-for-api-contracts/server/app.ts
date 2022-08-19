import express from 'express';
import path from 'path';
import { GetUsersApi } from '../shared-types/api/user';

import { logger } from './logger';

const app = express();

app.get<
  GetUsersApi['PathParams'],
  GetUsersApi['ResponseBody'],
  GetUsersApi['RequestBody'],
  GetUsersApi['QueryParams']
>('/api/users', async (req, res) => {
  const users = [{
    userId: 1,
    name: 'Alice',
  }, {
    userId: 2,
    name: 'Bob',
  }];

  res.status(200).json(users);
});

// `public/index.html` will be loaded on requests to `/`.
app.use('/', express.static(path.join(__dirname, 'public')));

app.listen(3000);
logger.info('Local server running on: http://localhost:3000');
