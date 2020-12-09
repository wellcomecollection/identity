import { RouteMiddleware } from '../types/application';

export const indexPage: RouteMiddleware = (context) => {
  const bundle = context.routes.url('assets-bundles');

  if (!context.isAuthenticated()) {
    context.redirect('/login');
    return;
  }

  console.log('current user ->', context.state.user);

  context.response.body = `
    <html lang="en">
      <head>
      <title>Account management</title>
      </head>
      <body>
        <div id="root"></div>

        <script type="application/javascript" src="${bundle}"></script>
      </body>
    </html>
  `;
};
