# Auth0 Actions

These are our [Auth0 Actions](https://auth0.com/docs/customize/actions) for the identity tenants. In general, actions can be used to decorate and enhance the basic capabilities of Auth0 at a variety of points within the authorization/authentication process.

At the moment, we have these actions:

- **`add_custom_claims`** - this action adds the user's barcode as a custom claim on their ID token. This is so that the [identity frontend app](https://github.com/wellcomecollection/wellcomecollection.org/tree/main/identity/webapp) can see all the relevant profile information in the user's session without having to go via the `/userinfo` or management APIs. 
