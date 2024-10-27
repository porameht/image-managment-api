import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import routes from './routes';

const port = process.env.PORT || 80;
const host = process.env.HOST || '0.0.0.0';

const app = new Elysia()
  .use(cors({
    origin: ['*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }))
  .use(swagger())
  .use(routes)
  .listen({
    port: port,
    hostname: host,
  });

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
