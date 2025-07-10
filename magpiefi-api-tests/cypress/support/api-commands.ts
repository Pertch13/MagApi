// Custom API commands for MagpieFi API testing

/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to make API requests with authentication
       * @param method - HTTP method (GET, POST, PUT, DELETE, etc.)
       * @param url - API endpoint URL
       * @param body - Request body (optional)
       * @param headers - Additional headers (optional)
       */
      apiRequest(
        method: string,
        url: string,
        body?: any,
        headers?: Record<string, string>
      ): Chainable<Cypress.Response<any>>

      /**
       * Custom command to authenticate and get auth token
       * @param credentials - User credentials
       */
      authenticate(credentials: {
        email: string
        password: string
      }): Chainable<Cypress.Response<any>>

      /**
       * Custom command to make authenticated API requests
       * @param method - HTTP method
       * @param url - API endpoint URL
       * @param body - Request body (optional)
       * @param token - Auth token (optional, will use stored if not provided)
       */
      authenticatedRequest(
        method: string,
        url: string,
        body?: any,
        token?: string
      ): Chainable<Cypress.Response<any>>

      /**
       * Custom command to validate API response structure
       * @param response - API response
       * @param schema - Expected schema object
       */
      validateResponse(
        response: Cypress.Response<any>,
        schema: Record<string, any>
      ): Chainable<Cypress.Response<any>>

      /**
       * Custom command to generate test data
       * @param dataType - Type of data to generate
       */
      generateTestData(dataType: string): Chainable<any>
    }
  }
}

// API Request command
Cypress.Commands.add('apiRequest', (method: string, url: string, body?: any, headers?: Record<string, string>) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'Cypress-API-Test'
  }

  const requestOptions: Partial<Cypress.RequestOptions> = {
    method: method as any,
    url: url.startsWith('http') ? url : `${Cypress.env('apiUrl')}${url}`,
    headers: { ...defaultHeaders, ...headers },
    failOnStatusCode: false,
    timeout: Cypress.env('timeout') || 10000
  }

  if (body) {
    requestOptions.body = body
  }

  return cy.request(requestOptions).then((response) => {
    cy.log(`API ${method} ${url} - Status: ${response.status}`)
    return cy.wrap(response)
  })
})

// Authentication command
Cypress.Commands.add('authenticate', (credentials: { email: string; password: string }) => {
  return cy.apiRequest('POST', '/auth/login', credentials).then((response) => {
    if (response.status === 200 && response.body.token) {
      cy.log('Authentication successful')
      cy.wrap(response.body.token).as('authToken')
      return response
    } else {
      throw new Error(`Authentication failed: ${response.body?.message || 'Unknown error'}`)
    }
  })
})

// Authenticated request command
Cypress.Commands.add('authenticatedRequest', (method: string, url: string, body?: any, token?: string) => {
  if (token) {
    // Use provided token directly
    const headers = {
      'Authorization': `Bearer ${token}`
    }
    return cy.apiRequest(method, url, body, headers)
  } else {
    // Get token from alias
    return cy.get('@authToken').then((storedToken: any) => {
      const authToken = storedToken as string
      const headers = {
        'Authorization': `Bearer ${authToken}`
      }
      return cy.apiRequest(method, url, body, headers)
    })
  }
})

// Response validation command
Cypress.Commands.add('validateResponse', (response: Cypress.Response<any>, schema: Record<string, any>) => {
  const validateObject = (obj: any, schemaObj: Record<string, any>, path = '') => {
    Object.keys(schemaObj).forEach((key) => {
      const currentPath = path ? `${path}.${key}` : key
      const expectedType = schemaObj[key]
      
      if (expectedType === 'required') {
        expect(obj, `${currentPath} should exist`).to.have.property(key)
      } else if (typeof expectedType === 'string') {
        expect(obj[key], `${currentPath} should be ${expectedType}`).to.be.a(expectedType)
      } else if (typeof expectedType === 'object' && expectedType !== null) {
        expect(obj, `${currentPath} should exist`).to.have.property(key)
        validateObject(obj[key], expectedType, currentPath)
      }
    })
  }

  validateObject(response.body, schema)
  return cy.wrap(response)
})

// Test data generation command
Cypress.Commands.add('generateTestData', (dataType: string) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { faker } = require('@faker-js/faker')
  
  const generators: Record<string, () => any> = {
    user: () => ({
      email: faker.internet.email(),
      password: faker.internet.password(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phone: faker.phone.number(),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: faker.location.country()
      }
    }),
    product: () => ({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      category: faker.commerce.department(),
      sku: faker.string.alphanumeric(8),
      inStock: faker.datatype.boolean()
    }),
    order: () => ({
      orderId: faker.string.uuid(),
      amount: parseFloat(faker.commerce.price()),
      currency: 'USD',
      status: faker.helpers.arrayElement(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
      items: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
        productId: faker.string.uuid(),
        quantity: faker.number.int({ min: 1, max: 10 }),
        price: parseFloat(faker.commerce.price())
      }))
    }),
    transaction: () => ({
      transactionId: faker.string.uuid(),
      amount: parseFloat(faker.commerce.price()),
      currency: 'USD',
      timestamp: faker.date.recent(),
      type: faker.helpers.arrayElement(['debit', 'credit', 'transfer']),
      status: faker.helpers.arrayElement(['pending', 'completed', 'failed'])
    })
  }

  const generator = generators[dataType]
  if (!generator) {
    throw new Error(`Unknown data type: ${dataType}`)
  }

  return cy.wrap(generator())
})

export {} 