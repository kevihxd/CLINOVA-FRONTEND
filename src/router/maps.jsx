import { ROUTES } from './routes.const';

export const moduleRoutes = Object.values(ROUTES)
  .flatMap(module => Object.values(module));
