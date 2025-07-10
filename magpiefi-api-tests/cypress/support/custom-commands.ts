// Additional custom commands for enhanced testing

/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to wait for API response and validate status
       * @param alias - Cypress alias for the intercepted request
       * @param expectedStatus - Expected HTTP status code
       */
      waitForApiResponse(alias: string, expectedStatus?: number): Chainable<any>

      /**
       * Custom command to set up API mocking
       * @param method - HTTP method
       * @param url - URL pattern to mock
       * @param response - Mock response data
       * @param statusCode - HTTP status code to return
       */
      mockApiResponse(
        method: string,
        url: string,
        response: any,
        statusCode?: number
      ): Chainable<any>

      /**
       * Custom command to generate and log test report data
       * @param testName - Name of the test
       * @param testData - Test execution data
       */
      logTestReport(testName: string, testData: Record<string, any>): Chainable<any>

      /**
       * Custom command to validate API performance
       * @param response - any
       * @param maxResponseTime - Maximum acceptable response time in ms
       */
      validatePerformance(
        response: any,
        maxResponseTime: number
      ): Chainable<any>

      /**
       * Custom command to handle pagination in API responses
       * @param baseUrl - Base API URL
       * @param params - Query parameters
       * @param maxPages - Maximum number of pages to fetch
       */
      handlePagination(
        baseUrl: string,
        params: Record<string, any>,
        maxPages?: number
      ): Chainable<any[]>
    }
  }
}

// Wait for API response command
Cypress.Commands.add('waitForApiResponse', (alias: string, expectedStatus: number = 200) => {
  return cy.wait(`@${alias}`).then((interception) => {
    if (expectedStatus) {
      expect(interception.response?.statusCode).to.equal(expectedStatus)
    }
    return interception
  })
})

// Mock API response command
Cypress.Commands.add('mockApiResponse', (method: string, url: string, response: any, statusCode: number = 200) => {
  return cy.intercept({
    method: method as any,
    url: url
  }, {
    statusCode,
    body: response,
    headers: {
      'Content-Type': 'application/json'
    }
  }).as(`mock${method}${url.replace(/[^a-zA-Z0-9]/g, '')}`)
})

// Log test report command
Cypress.Commands.add('logTestReport', (testName: string, testData: Record<string, any>) => {
  const report = {
    testName,
    timestamp: new Date().toISOString(),
    environment: Cypress.env('TEST_ENV') || 'development',
    ...testData
  }
  
  cy.log('Test Report:', JSON.stringify(report, null, 2))
  
  // You can extend this to save to external reporting systems
  return cy.wrap(report)
})

// Validate performance command
Cypress.Commands.add('validatePerformance', (response: any, maxResponseTime: number) => {
  const responseTime = response.duration || 0
  
  cy.log(`Response time: ${responseTime}ms (Max: ${maxResponseTime}ms)`)
  
  expect(responseTime, `Response time should be less than ${maxResponseTime}ms`).to.be.lessThan(maxResponseTime)
  
  return cy.wrap(response)
})

// Handle pagination command
Cypress.Commands.add('handlePagination', (baseUrl: string, params: Record<string, any>, maxPages: number = 10) => {
  const allResults: any[] = []
  let currentPage = 1
  let hasNextPage = true

  const fetchPage = (page: number): Cypress.Chainable<any[]> => {
    return cy.apiRequest('GET', `${baseUrl}?${new URLSearchParams({
      ...params,
      page: page.toString()
    }).toString()}`).then((response) => {
      if (response.status === 200) {
        const data = response.body
        
        // Assume the API returns data in a standard format
        const items = data.items || data.data || data.results || []
        allResults.push(...items)
        
        // Check if there's a next page (adjust based on your API structure)
        hasNextPage = data.hasNextPage || 
                     data.nextPage || 
                     (data.totalPages && currentPage < data.totalPages) ||
                     (data.pagination && data.pagination.hasNext) ||
                     items.length > 0
        
        if (hasNextPage && currentPage < maxPages) {
          currentPage++
          return fetchPage(currentPage)
        }
        
        return cy.wrap(allResults)
      } else {
        throw new Error(`Failed to fetch page ${page}: ${response.status}`)
      }
    })
  }

  return fetchPage(1)
})

export {} 