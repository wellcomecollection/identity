describe('Registration page', () => {
  it('contains the heading text', () => {
    cy.visit('/register');
    cy.get('h1').contains('Register');
  });
});
