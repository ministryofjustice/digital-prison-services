context('Health page reports health correctly', () => {
  it('Reports correctly when some down', () => {
    cy.task('reset')
    cy.task('stubHealthAllHealthy')
    cy.task('stubAuthHealth', 500)
    cy.task('stubPrisonApiHealth', 500)
    cy.request({ url: '/health', method: 'GET', failOnStatusCode: false }).then((response) => {
      expect(response.body.name).to.equal('digital-prison-services')
      // eslint-disable-next-line no-unused-expressions
      expect(response.body.version).to.not.be.empty
      expect(response.body.api).to.deep.equal({
        allocationManager: 'UP',
        auth: { timeout: 1000, code: 'ECONNABORTED', errno: 'ETIMEDOUT', retries: 2 },
        casenotes: 'UP',
        community: 'UP',
        prisonApi: { timeout: 1000, code: 'ECONNABORTED', errno: 'ETIMEDOUT', retries: 2 },
        keyworker: 'UP',
        tokenverification: 'UP',
        whereabouts: 'UP',
        offenderSearch: 'UP',
        complexity: 'UP',
        incentivesApi: 'UP',
      })
    })
  })

  it('Reports correctly when all are up', () => {
    cy.task('reset')
    cy.task('stubHealthAllHealthy')
    cy.request('/health').then((response) => {
      expect(response.body.uptime).to.be.greaterThan(0.0)
      expect(response.body.name).to.equal('digital-prison-services')
      // eslint-disable-next-line no-unused-expressions
      expect(response.body.version).to.not.be.empty
      expect(response.body.api).to.deep.equal({
        allocationManager: 'UP',
        auth: 'UP',
        casenotes: 'UP',
        community: 'UP',
        prisonApi: 'UP',
        keyworker: 'UP',
        tokenverification: 'UP',
        whereabouts: 'UP',
        offenderSearch: 'UP',
        complexity: 'UP',
        incentivesApi: 'UP',
      })
    })
  })
})
