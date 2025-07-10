describe('MagpieFi API - Smoke Tests', () => {
  it('should verify API is accessible', () => {
    cy.apiRequest('GET', '/')
      .then((response) => {
        // API returns 404 for root but with a proper JSON response
        expect(response.status).to.equal(404)
        expect(response.body).to.have.property('message')
        expect(response.body.message).to.include('no Route matched')
        expect(response.body).to.have.property('request_id')
      })
  })

  it('should verify API returns proper headers', () => {
    cy.apiRequest('GET', '/')
      .then((response) => {
        expect(response.headers).to.have.property('content-type')
        expect(response.headers['content-type']).to.include('application/json')
      })
  })

  it('should verify API response time is acceptable', () => {
    const startTime = Date.now()
    
    cy.apiRequest('GET', '/')
      .then((response) => {
        const responseTime = Date.now() - startTime
        expect(response.status).to.be.oneOf([200, 404]) // Either success or expected 404
        expect(responseTime).to.be.lessThan(5000) // 5 seconds max
        cy.log(`Response time: ${responseTime}ms`)
      })
  })

  it('should handle quote endpoint with missing parameters', () => {
    cy.apiRequest('GET', '/aggregator/quote')
      .then((response) => {
        // Should return 400 for missing required parameters
        expect(response.status).to.be.oneOf([400, 422])
        expect(response.body).to.have.property('message')
      })
  })

  it('should verify quote endpoint structure with invalid parameters', () => {
    // Test with invalid but present parameters
    cy.apiRequest('GET', '/aggregator/quote?network=invalid&fromTokenAddress=0x123&toTokenAddress=0x456&sellAmount=1000&slippage=0.01&gasless=false')
      .then((response) => {
        // Should return an error response but with proper structure
        expect(response.status).to.be.oneOf([400, 422, 500])
        expect(response.body).to.have.property('message')
        cy.log(`Quote endpoint error response: ${response.body.message}`)
      })
  })
}) 