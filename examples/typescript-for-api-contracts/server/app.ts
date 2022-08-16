import express from 'express';
import path from 'path';

const app = express();

app.get('/api', async (req, res) => {
  res.status(200).send('Done');
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000);
console.log('listening');
