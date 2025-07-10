import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'https://api.fly.trade',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    fixturesFolder: 'cypress/fixtures',
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    retries: {
      runMode: 2,
      openMode: 0
    },
    env: {
      apiUrl: 'https://api.fly.trade',
      timeout: 10000,
      retries: 2
    },
    setupNodeEvents(on: any, config: any) {
      // implement node event listeners here
      on('task', {
        log(message: string) {
          console.log(message)
          return null
        }
      })
      
      // Load environment variables
      import('dotenv').then(dotenv => dotenv.config())
      
      // Override config with environment variables
      config.env.apiUrl = process.env.API_URL || config.env.apiUrl
      config.env.authToken = process.env.AUTH_TOKEN || ''
      config.env.testUser = process.env.TEST_USER || ''
      config.env.testPassword = process.env.TEST_PASSWORD || ''
      
      return config
    }
  },
  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
    },
  },
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/reports',
    overwrite: false,
    html: true,
    json: true,
    timestamp: 'mmddyyyy_HHMMss'
  }
}) 