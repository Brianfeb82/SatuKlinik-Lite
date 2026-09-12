import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { r } from './routes/index.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true, app: 'satuklinik-lite-api', fhir: 'R4', mode: process.env.SATUSEHAT_MODE ?? 'mock' }));
app.use('/', r);

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => console.log(`[api] listening on http://localhost:${port}`));
