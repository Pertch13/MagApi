// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.ts using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Import API utilities and helpers
import './api-commands'
import './custom-commands'

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing on uncaught exceptions
  console.log('Uncaught exception:', err.message)
  return false
})

// Global hooks
beforeEach(() => {
  // Set up common configurations for each test
  cy.log('Setting up test environment')
  
  // Add custom headers if needed
  cy.intercept('**', (req) => {
    req.headers['User-Agent'] = 'Cypress Test Agent'
    req.headers['Accept'] = 'application/json'
  })
})

afterEach(() => {
  // Clean up after each test
  cy.log('Cleaning up test environment')
}) 