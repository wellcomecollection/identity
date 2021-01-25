describe('Login', () => {
  it('logs in successfully', () => {
    cy.visit('/login');
    cy.get('input[name=username]').type('test');
    cy.get('input[name=password]').type('test');
    cy.get('input[type=submit]').click();
    cy.url().should('include', '/app');
  });
});
