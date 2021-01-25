describe('Login', () => {
  it('logs in successfully', () => {
    cy.visit('/login');
    cy.get('input[name=username]').type(Cypress.env('TEST_USER'));
    cy.get('input[name=password]').type(Cypress.env('TEST_PASSWORD'));
    cy.get('input[type=submit]').click();
    cy.url().should('include', '/app');
  });
});
