describe('Login', () => {
  it('logs in successfully', () => {
    cy.visit('/login');
    cy.get('input[name=username]').type(Cypress.env('username'));
    cy.get('input[name=password]').type(Cypress.env('password'));
    cy.get('input[type=submit]').click();
    cy.url().should('include', '/app');
  });
});
