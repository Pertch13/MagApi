# Quick Start Guide

Get up and running with the MagpieFi API Test Framework in 5 minutes!

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
```bash
cp env.example .env
# Edit .env with your API credentials
```

### 3. Run Your First Test
```bash
npm run test:smoke
```

## 🎯 Essential Commands

| Command | Description |
|---------|-------------|
| `npm run cy:open` | Open Cypress Test Runner |
| `npm run cy:run` | Run all tests headlessly |
| `npm run test:smoke` | Run smoke tests |
| `npm run test:api` | Run API tests |
| `npm run lint` | Check code quality |

## 📝 Writing Your First Test

Create a new test file: `cypress/e2e/my-first-test.cy.ts`

```typescript
describe('My First API Test', () => {
  it('should verify API health', () => {
    cy.apiRequest('GET', '/health')
      .then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.status).to.equal('ok')
      })
  })

  it('should authenticate user', () => {
    cy.authenticate({
      email: 'test@example.com',
      password: 'password123'
    }).then(() => {
      cy.authenticatedRequest('GET', '/profile')
        .then((response) => {
          expect(response.status).to.equal(200)
          expect(response.body).to.have.property('user')
        })
    })
  })
})
```

## 🧪 Test Data Generation

Generate dynamic test data:

```typescript
cy.generateTestData('user').then((userData) => {
  cy.apiRequest('POST', '/users', userData)
    .then((response) => {
      expect(response.status).to.equal(201)
      expect(response.body.email).to.equal(userData.email)
    })
})
```

## 🔧 Configuration

### Environment Variables (.env)
```env
API_URL=https://api.magpiefi.xyz
AUTH_TOKEN=your_token_here
TEST_USER=test@example.com
TEST_PASSWORD=password123
```

### Cypress Configuration
Main configuration is in `cypress.config.ts`:
- Base URL
- Timeouts
- Retries
- Reporting

## 📊 Viewing Test Results

### In Browser
```bash
npm run cy:open
```

### HTML Reports
```bash
npm run cy:run
npm run report
open cypress/reports/html/index.html
```

## 🛠️ Custom Commands

### Available Commands
- `cy.apiRequest()` - Make API calls
- `cy.authenticate()` - Login users
- `cy.authenticatedRequest()` - Authenticated API calls
- `cy.generateTestData()` - Generate test data
- `cy.validateResponse()` - Validate API responses

### Example Usage
```typescript
// Basic API request
cy.apiRequest('GET', '/users')

// Authenticated request
cy.authenticatedRequest('POST', '/users', userData)

// Response validation
cy.validateResponse(response, {
  id: 'string',
  email: 'string',
  name: 'string'
})
```

## 📚 Next Steps

1. **Explore Examples**: Check `cypress/e2e/` for example tests
2. **Read Documentation**: Review the full README.md
3. **Add More Tests**: Create tests for your specific API endpoints
4. **Set Up CI/CD**: Use the GitHub Actions workflow
5. **Customize**: Modify configurations to match your needs

## 🆘 Common Issues

### Dependencies Not Installing
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
npm run type-check
```

### Tests Not Running
1. Check your `.env` file
2. Verify API URL is accessible
3. Check authentication credentials

## 💡 Pro Tips

1. **Use Test Data**: Always use `cy.generateTestData()` for unique data
2. **Handle Authentication**: Use `cy.authenticate()` for protected endpoints
3. **Validate Responses**: Always validate status codes and response structure
4. **Keep Tests Independent**: Each test should be able to run in isolation
5. **Use Descriptive Names**: Write clear test descriptions

## 🔗 Useful Links

- [Cypress Documentation](https://docs.cypress.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [API Testing Best Practices](https://blog.postman.com/api-testing-best-practices/)

Happy Testing! 🎉 