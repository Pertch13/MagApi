# MagpieFi API Test Automation Framework

A comprehensive Cypress-based TypeScript automation framework for testing MagpieFi API endpoints.

## 📝 Framework Creation Notes

This automation framework was created using:
- **Personal Templates**: Built upon proven testing framework templates and best practices
- **Cursor.ai**: Leveraged AI-powered development assistance for rapid framework setup and optimization
- **Industry Standards**: Incorporates modern testing patterns and TypeScript best practices

The framework combines human expertise with AI assistance to deliver a production-ready testing solution.

## 🚀 Features

- **TypeScript Support**: Full TypeScript integration with type safety
- **Custom API Commands**: Dedicated Cypress commands for API testing
- **Test Data Management**: Fixtures and dynamic test data generation
- **Response Validation**: Schema validation and performance testing
- **Authentication Handling**: Built-in authentication and token management
- **Reporting**: Mochawesome HTML reports with screenshots and videos
- **CI/CD Ready**: Configured for continuous integration
- **Parallel Execution**: Support for parallel test execution
- **Custom Utilities**: Helper functions for common testing scenarios

## 📁 Project Structure

```
magpiefi-api-tests/
├── cypress/
│   ├── e2e/                    # Test files
│   │   ├── api/               # API-specific tests
│   │   │   ├── authentication.cy.ts
│   │   │   ├── users.cy.ts
│   │   │   └── transactions.cy.ts
│   │   ├── smoke/             # Smoke tests
│   │   │   └── health-check.cy.ts
│   │   └── regression/        # Regression tests
│   ├── fixtures/              # Test data
│   │   └── test-data.json
│   ├── support/               # Support files
│   │   ├── commands.ts        # Custom commands
│   │   ├── api-commands.ts    # API-specific commands
│   │   ├── custom-commands.ts # Additional utilities
│   │   └── e2e.ts            # Main support file
│   └── utils/                 # Utility functions
│       └── api-helpers.ts     # API helper functions
├── cypress.config.ts          # Cypress configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies and scripts
├── .eslintrc.js             # ESLint configuration
├── env.example              # Environment variables example
└── README.md                # This file
```

## 🛠️ Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd magpiefi-api-tests
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env file with your configuration
   ```

4. **Verify installation:**
   ```bash
   npm run cy:open
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# API Configuration
API_URL=https://api.magpiefi.xyz
API_VERSION=v1
API_TIMEOUT=10000

# Authentication
AUTH_TOKEN=your_auth_token_here
API_KEY=your_api_key_here

# Test User Credentials
TEST_USER=test@example.com
TEST_PASSWORD=test_password
```

### Cypress Configuration

The framework is configured via `cypress.config.ts`:

- **Base URL**: API endpoint URL
- **Timeouts**: Request, response, and command timeouts
- **Retries**: Automatic retry configuration
- **Reporting**: Mochawesome reporter configuration
- **Environment**: Test environment variables

## 🎯 Usage

### Running Tests

```bash
# Open Cypress Test Runner
npm run cy:open

# Run all tests headlessly
npm run cy:run

# Run specific test suites
npm run test:api
npm run test:smoke
npm run test:regression

# Run tests in different browsers
npm run cy:run:chrome
npm run cy:run:firefox
npm run cy:run:edge
```

### Test Categories

- **Smoke Tests**: Basic functionality and health checks
- **API Tests**: Comprehensive API endpoint testing
- **Regression Tests**: Full regression test suite

### Writing Tests

#### Basic API Test

```typescript
describe('User API Tests', () => {
  it('should create a new user', () => {
    cy.generateTestData('user').then((userData) => {
      cy.apiRequest('POST', '/users', userData)
        .then((response) => {
          expect(response.status).to.equal(201)
          expect(response.body).to.have.property('id')
          expect(response.body.email).to.equal(userData.email)
        })
    })
  })
})
```

#### Authenticated API Test

```typescript
describe('Protected Endpoints', () => {
  beforeEach(() => {
    cy.authenticate({
      email: 'test@example.com',
      password: 'password123'
    })
  })

  it('should access protected resource', () => {
    cy.authenticatedRequest('GET', '/protected-resource')
      .then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body).to.have.property('data')
      })
  })
})
```

## 🧪 Custom Commands

### API Commands

- `cy.apiRequest(method, url, body?, headers?)` - Make API requests
- `cy.authenticate(credentials)` - Authenticate user
- `cy.authenticatedRequest(method, url, body?, token?)` - Authenticated requests
- `cy.validateResponse(response, schema)` - Validate response structure
- `cy.generateTestData(type)` - Generate test data

### Utility Commands

- `cy.waitForApiResponse(alias, expectedStatus?)` - Wait for API response
- `cy.mockApiResponse(method, url, response, statusCode?)` - Mock API responses
- `cy.validatePerformance(response, maxTime)` - Validate response time
- `cy.handlePagination(baseUrl, params, maxPages?)` - Handle paginated responses

## 📊 Test Data Management

### Fixtures

Test data is stored in `cypress/fixtures/test-data.json`:

```json
{
  "users": {
    "validUser": {
      "email": "test@example.com",
      "password": "password123"
    }
  }
}
```

### Dynamic Data Generation

Use the `generateTestData` command for dynamic test data:

```typescript
cy.generateTestData('user').then((userData) => {
  // Use generated user data
})
```

## 🔍 Response Validation

### Schema Validation

```typescript
cy.validateResponse(response, {
  user: {
    id: 'string',
    email: 'string',
    firstName: 'string',
    lastName: 'string'
  },
  token: 'string'
})
```

### Performance Validation

```typescript
cy.validatePerformance(response, 2000) // Max 2 seconds
```

## 📈 Reporting

### HTML Reports

Reports are generated using Mochawesome:

```bash
npm run report
```

Reports are saved in `cypress/reports/html/`

### CI/CD Integration

The framework supports various CI/CD platforms:

#### GitHub Actions Example

```yaml
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run cy:run
```

## 🔧 Utilities

### API Helpers

The `ApiHelpers` class provides utility functions:

```typescript
import { ApiHelpers } from '../utils/api-helpers'

// Generate headers
const headers = ApiHelpers.getAuthHeaders(token)

// Format URLs
const url = ApiHelpers.formatUrl('/users', { page: 1, limit: 10 })

// Retry operations
const result = await ApiHelpers.retryOperation(operation, 3)
```

## 🧹 Code Quality

### Linting

```bash
npm run lint
npm run lint:fix
```

### Type Checking

```bash
npm run type-check
```

## 🐛 Debugging

### Debug Mode

Set environment variable:
```bash
DEBUG=cypress:*
```

### Logging

Use custom logging:
```typescript
cy.logTestReport('Test Name', {
  endpoint: '/api/users',
  method: 'POST',
  status: 'success'
})
```

## 📚 Best Practices

1. **Use Page Object Model** for complex test scenarios
2. **Keep tests independent** and idempotent
3. **Use meaningful test descriptions**
4. **Clean up test data** after each test
5. **Handle flaky tests** with retries and waits
6. **Use fixtures** for static test data
7. **Generate dynamic data** for unique test scenarios
8. **Validate both positive and negative scenarios**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For issues and questions:
- Check the [Cypress Documentation](https://docs.cypress.io/)
- Review existing tests for examples
- Create an issue in the repository

## 🔮 Future Enhancements

- [ ] Integration with test management tools
- [ ] Advanced reporting with test analytics
- [ ] Performance benchmarking
- [ ] Visual regression testing
- [ ] Integration with monitoring tools
- [ ] Advanced data seeding capabilities 