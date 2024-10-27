import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import pino from 'pino';
import routes from './routes';

const port = process.env.PORT || 80;
const host = process.env.HOST || '0.0.0.0';

const logger = pino();

const app = new Elysia()
  .use(cors({
    origin: ['*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }))
  .use(swagger())
  .use((app) => {
    app.onRequest((context) => {
      logger.info(`Request: ${context.request.method} ${context.request.url}`);
    });
    app.onResponse((context) => {
      logger.info(`Response: ${context.response.status}`);
    });
    return app;
  })
  .use(routes)
  .listen({
    port: port,
    hostname: host,
  });

logger.info(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
