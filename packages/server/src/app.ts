import express, { Request, Response } from 'express';

const PORT = process.env.PORT || 3001;
const app = express();

app.use('/', (req: Request, res: Response) => {
  res.end('Hello world from @hackbox/server');
});

app.listen(PORT, () => {
  console.log(`@hackbox/server running in port ${PORT}`);
});
