import { TypedRouter } from '../utility/typed-router';
import { RouteMiddleware } from '../types/application';
import { ping } from './ping'

export const registrationRoutes: any = {
  register: [
    TypedRouter.GET,
    '/register',
    ((ctx) => {
      ctx.response.body = ping;
    }) as RouteMiddleware,
  ],
};
