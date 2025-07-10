// API Helper utilities for MagpieFi API testing

import { faker } from '@faker-js/faker'

export class ApiHelpers {
  /**
   * Generate common API request headers
   * @param additionalHeaders - Additional headers to include
   * @returns Object containing headers
   */
  static getCommonHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Cypress-API-Test',
      ...additionalHeaders
    }
  }

  /**
   * Generate authorization headers
   * @param token - Authorization token
   * @param tokenType - Type of token (Bearer, Basic, etc.)
   * @returns Object containing authorization headers
   */
  static getAuthHeaders(token: string, tokenType: string = 'Bearer'): Record<string, string> {
    return {
      ...this.getCommonHeaders(),
      'Authorization': `${tokenType} ${token}`
    }
  }

  /**
   * Format URL with query parameters
   * @param baseUrl - Base URL
   * @param params - Query parameters
   * @returns Formatted URL string
   */
  static formatUrl(baseUrl: string, params: Record<string, any> = {}): string {
    const url = new URL(baseUrl)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString())
      }
    })
    return url.toString()
  }

  /**
   * Validate response status code
   * @param response - API response
   * @param expectedStatus - Expected status code
   * @throws Error if status doesn't match
   */
  static validateStatus(response: any, expectedStatus: number): void {
    if (response.status !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, got ${response.status}`)
    }
  }

  /**
   * Extract error message from API response
   * @param response - API response
   * @returns Error message string
   */
  static extractErrorMessage(response: any): string {
    if (response.body) {
      return response.body.message || 
             response.body.error || 
             response.body.errors?.join(', ') ||
             `HTTP ${response.status} Error`
    }
    return `HTTP ${response.status} Error`
  }

  /**
   * Generate test data for different entity types
   * @param entityType - Type of entity to generate data for
   * @param overrides - Optional overrides for generated data
   * @returns Generated test data object
   */
  static generateTestData(entityType: string, overrides: Record<string, any> = {}): any {
    const generators: Record<string, () => any> = {
      user: () => ({
        email: faker.internet.email(),
        password: faker.internet.password({ length: 12 }),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phone: faker.phone.number(),
        dateOfBirth: faker.date.past(30, new Date('2000-01-01')),
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          zipCode: faker.location.zipCode(),
          country: faker.location.country()
        },
        preferences: {
          language: faker.helpers.arrayElement(['en', 'es', 'fr', 'de']),
          timezone: faker.location.timeZone(),
          notifications: faker.datatype.boolean()
        }
      }),
      
      account: () => ({
        accountId: faker.string.uuid(),
        accountType: faker.helpers.arrayElement(['savings', 'checking', 'credit', 'investment']),
        balance: parseFloat(faker.finance.amount()),
        currency: faker.finance.currencyCode(),
        status: faker.helpers.arrayElement(['active', 'inactive', 'suspended', 'closed']),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      }),

      transaction: () => ({
        transactionId: faker.string.uuid(),
        amount: parseFloat(faker.finance.amount()),
        currency: faker.finance.currencyCode(),
        type: faker.helpers.arrayElement(['debit', 'credit', 'transfer', 'payment']),
        status: faker.helpers.arrayElement(['pending', 'completed', 'failed', 'cancelled']),
        description: faker.finance.transactionDescription(),
        timestamp: faker.date.recent(),
        metadata: {
          source: faker.helpers.arrayElement(['web', 'mobile', 'api']),
          reference: faker.string.alphanumeric(10)
        }
      }),

      product: () => ({
        productId: faker.string.uuid(),
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price()),
        currency: 'USD',
        category: faker.commerce.department(),
        sku: faker.string.alphanumeric(8),
        inStock: faker.datatype.boolean(),
        tags: faker.helpers.arrayElements(['new', 'popular', 'sale', 'featured'], { min: 1, max: 3 })
      }),

      order: () => ({
        orderId: faker.string.uuid(),
        customerId: faker.string.uuid(),
        status: faker.helpers.arrayElement(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
        totalAmount: parseFloat(faker.commerce.price()),
        currency: 'USD',
        items: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
          productId: faker.string.uuid(),
          quantity: faker.number.int({ min: 1, max: 10 }),
          price: parseFloat(faker.commerce.price()),
          name: faker.commerce.productName()
        })),
        shippingAddress: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          zipCode: faker.location.zipCode(),
          country: faker.location.country()
        },
        orderDate: faker.date.recent()
      })
    }

    const generator = generators[entityType]
    if (!generator) {
      throw new Error(`Unknown entity type: ${entityType}`)
    }

    return { ...generator(), ...overrides }
  }

  /**
   * Wait for a condition to be true with polling
   * @param condition - Function that returns boolean
   * @param timeout - Maximum time to wait in milliseconds
   * @param interval - Polling interval in milliseconds
   * @returns Promise that resolves when condition is met
   */
  static async waitForCondition(
    condition: () => boolean | Promise<boolean>,
    timeout: number = 30000,
    interval: number = 1000
  ): Promise<void> {
    const startTime = Date.now()
    
    while (Date.now() - startTime < timeout) {
      const result = await condition()
      if (result) {
        return
      }
      await new Promise(resolve => setTimeout(resolve, interval))
    }
    
    throw new Error(`Condition not met within ${timeout}ms`)
  }

  /**
   * Retry an operation with exponential backoff
   * @param operation - Function to retry
   * @param maxRetries - Maximum number of retries
   * @param baseDelay - Base delay in milliseconds
   * @returns Promise with operation result
   */
  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        
        if (attempt === maxRetries) {
          throw lastError
        }
        
        const delay = baseDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw lastError!
  }

  /**
   * Deep merge two objects
   * @param target - Target object
   * @param source - Source object
   * @returns Merged object
   */
  static deepMerge(target: any, source: any): any {
    if (source === null || typeof source !== 'object') {
      return source
    }
    
    if (target === null || typeof target !== 'object') {
      return source
    }
    
    const result = { ...target }
    
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (typeof source[key] === 'object' && source[key] !== null) {
          result[key] = this.deepMerge(result[key], source[key])
        } else {
          result[key] = source[key]
        }
      }
    }
    
    return result
  }

  /**
   * Sanitize sensitive data for logging
   * @param data - Data object to sanitize
   * @param sensitiveFields - Array of field names to redact
   * @returns Sanitized data object
   */
  static sanitizeForLogging(data: any, sensitiveFields: string[] = ['password', 'token', 'secret', 'key']): any {
    if (typeof data !== 'object' || data === null) {
      return data
    }
    
    const sanitized = { ...data }
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***'
      }
    }
    
    return sanitized
  }
}

export default ApiHelpers 