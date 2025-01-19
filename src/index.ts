import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import pino from 'pino';
import routes from './routes';
import { CORS_OPTIONS } from './constant';

const port = process.env.PORT || 80;
const host = process.env.HOST || '0.0.0.0';

const logger = pino();

const app = new Elysia()
  .use(cors({
    origin: CORS_OPTIONS.ORIGIN,
    methods: CORS_OPTIONS.METHODS,
    allowedHeaders: CORS_OPTIONS.ALLOWED_HEADERS,
    credentials: CORS_OPTIONS.CREDENTIALS,
  }))
  .use(swagger())
  .use((app) => {
    app.onRequest((context) => {
      logger.info(`Request: ${context.request.method} ${context.request.url}`);
    });
    return app;
  })
  .use(routes)
  .listen({
    port: port,
    hostname: host,
  });

logger.info(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
