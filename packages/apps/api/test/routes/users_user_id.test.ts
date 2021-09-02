describe('/users/{userId}', () => {
  describe('GET /users/{userId}', () => {
    it('fetches a user', () => {});
    it('404s for users that do not exist', () => {});
  });

  describe('PUT /users/{userId}', () => {
    it('updates a user', () => {});
    it('does not update immutable fields for non-admins');
    it(
      'does not update emails if a user with that email already exists in Sierra'
    );
    it(
      'does not update emails if a user with that email already exists in Auth0'
    );
  });

  describe('DELETE /users/{userId}', () => {
    it('deletes a user in Auth0 and Sierra', () => {});
    it('404s for users that do not exist', () => {});
  });
});
