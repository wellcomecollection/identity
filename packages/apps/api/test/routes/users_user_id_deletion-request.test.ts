describe('/users/{userId}/deletion-request', () => {
  describe('PUT /users/{userId}/deletion-request', () => {
    it('marks a user as having requested deletion', () => {});
    it('304s for a user already marked for deletion', () => {});
    it('404s for users that do not exist', () => {});
  });

  describe('DELETE /users/{userId}/deletion-request', () => {
    it('unmarks a user as having requested deletion', () => {});
    it('304s for an unmarked user', () => {});
    it('404s for users that do not exist', () => {});
  });
});
