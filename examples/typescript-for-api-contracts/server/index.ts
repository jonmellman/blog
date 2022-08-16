import * as express from 'express';

const app = express();

app.get('/', async (req, res) => {
  res.status(200).send('Done');
});

app.listen(3000);
console.log('listening');
