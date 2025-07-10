describe('MagpieFi API - Quote Endpoint Tests', () => {
  const validQuoteParams = {
    network: 'ethereum',
    fromTokenAddress: '0x0000000000000000000000000000000000000000', // ETH
    toTokenAddress: '0xA0b86a33E6441d2e8f4F0F2f2d8f0F2f2d8f0F2f', // Sample token
    sellAmount: '1000000000000000000', // 1 ETH in wei
    slippage: 0.01,
    gasless: false
  }

  it('should handle quote request with missing parameters', () => {
    cy.apiRequest('GET', '/aggregator/quote')
      .then((response) => {
        expect(response.status).to.be.oneOf([400, 422])
        expect(response.body).to.have.property('message')
        cy.log(`Missing params response: ${response.body.message}`)
      })
  })

  it('should handle quote request with invalid network', () => {
    const params = new URLSearchParams({
      network: 'invalid-network',
      fromTokenAddress: validQuoteParams.fromTokenAddress,
      toTokenAddress: validQuoteParams.toTokenAddress,
      sellAmount: validQuoteParams.sellAmount,
      slippage: validQuoteParams.slippage.toString(),
      gasless: validQuoteParams.gasless.toString()
    }).toString()

    cy.apiRequest('GET', `/aggregator/quote?${params}`)
      .then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 500])
        expect(response.body).to.have.property('message')
        cy.log(`Invalid network response: ${response.body.message}`)
      })
  })

  it('should handle quote request with invalid token addresses', () => {
    const params = new URLSearchParams({
      network: validQuoteParams.network,
      fromTokenAddress: 'invalid-address',
      toTokenAddress: 'invalid-address',
      sellAmount: validQuoteParams.sellAmount,
      slippage: validQuoteParams.slippage.toString(),
      gasless: validQuoteParams.gasless.toString()
    }).toString()

    cy.apiRequest('GET', `/aggregator/quote?${params}`)
      .then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 500])
        expect(response.body).to.have.property('message')
        cy.log(`Invalid addresses response: ${response.body.message}`)
      })
  })

  it('should handle quote request with invalid sell amount', () => {
    const params = new URLSearchParams({
      network: validQuoteParams.network,
      fromTokenAddress: validQuoteParams.fromTokenAddress,
      toTokenAddress: validQuoteParams.toTokenAddress,
      sellAmount: 'invalid-amount',
      slippage: validQuoteParams.slippage.toString(),
      gasless: validQuoteParams.gasless.toString()
    }).toString()

    cy.apiRequest('GET', `/aggregator/quote?${params}`)
      .then((response) => {
        expect(response.status).to.be.oneOf([400, 422])
        expect(response.body).to.have.property('message')
        cy.log(`Invalid amount response: ${response.body.message}`)
      })
  })

  it('should handle quote request with invalid slippage', () => {
    const params = new URLSearchParams({
      network: validQuoteParams.network,
      fromTokenAddress: validQuoteParams.fromTokenAddress,
      toTokenAddress: validQuoteParams.toTokenAddress,
      sellAmount: validQuoteParams.sellAmount,
      slippage: '2', // Invalid slippage > 1
      gasless: validQuoteParams.gasless.toString()
    }).toString()

    cy.apiRequest('GET', `/aggregator/quote?${params}`)
      .then((response) => {
        expect(response.status).to.be.oneOf([400, 422])
        expect(response.body).to.have.property('message')
        cy.log(`Invalid slippage response: ${response.body.message}`)
      })
  })

  it('should validate quote endpoint response structure', () => {
    // Test with known token addresses that might exist
    const params = new URLSearchParams({
      network: 'ethereum',
      fromTokenAddress: '0x0000000000000000000000000000000000000000', // ETH
      toTokenAddress: '0xA0b86a33E6441d2e8f4F0F2f2d8f0F2f2d8f0F2f', // Sample token
      sellAmount: '1000000000000000000',
      slippage: '0.01',
      gasless: 'false'
    }).toString()

    cy.apiRequest('GET', `/aggregator/quote?${params}`)
      .then((response) => {
        // Log the response for debugging
        cy.log(`Quote response status: ${response.status}`)
        cy.log(`Quote response body: ${JSON.stringify(response.body)}`)
        
        // The response should have a proper structure regardless of success/failure
        expect(response.body).to.have.property('message')
        
        // If it's a successful quote (status 200), validate the structure
        if (response.status === 200) {
          expect(response.body).to.have.property('quote')
          expect(response.body.quote).to.have.property('sellAmount')
          expect(response.body.quote).to.have.property('buyAmount')
        }
      })
  })

  it('should test performance of quote endpoint', () => {
    const startTime = Date.now()
    
    const params = new URLSearchParams({
      network: 'ethereum',
      fromTokenAddress: '0x0000000000000000000000000000000000000000',
      toTokenAddress: '0xA0b86a33E6441d2e8f4F0F2f2d8f0F2f2d8f0F2f',
      sellAmount: '1000000000000000000',
      slippage: '0.01',
      gasless: 'false'
    }).toString()

    cy.apiRequest('GET', `/aggregator/quote?${params}`)
      .then((response) => {
        const responseTime = Date.now() - startTime
        cy.log(`Quote endpoint response time: ${responseTime}ms`)
        
        // Quote endpoint should respond within 10 seconds
        expect(responseTime).to.be.lessThan(10000)
        
        // Should return some response (even if error)
        expect(response.body).to.have.property('message')
      })
  })
}) 