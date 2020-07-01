context('Health page reports health correctly', () => {
  beforeEach(() => {
    cy.task('reset')
  })
  it('Reports correctly when all are up', () => {
    cy.task('stubHealth', {})
    cy.request('/health').then(response => {
      expect(response.body.uptime).to.be.greaterThan(0.0)
      expect(response.body.name).to.equal('prisonstaffhub')
      // eslint-disable-next-line no-unused-expressions
      expect(response.body.version).to.not.be.empty
      expect(response.body.api).to.deep.equal({
        allocationManager: 'UP',
        auth: 'UP',
        casenotes: 'UP',
        community: 'UP',
        elite2: 'UP',
        keyworker: 'UP',
        tokenverification: 'UP',
        whereabouts: 'UP',
      })
    })
  })

  it('Reports correctly when some down', () => {
    cy.task('stubHealth', { elite2Status: 500 })
    cy.request('/health').then(response => {
      expect(response.body.name).to.equal('prisonstaffhub')
      // eslint-disable-next-line no-unused-expressions
      expect(response.body.version).to.not.be.empty
      expect(response.body.api).to.deep.equal({
        allocationManager: 'UP',
        auth: 'UP',
        casenotes: 'UP',
        community: 'UP',
        elite2: { timeout: 1000, code: 'ECONNABORTED', errno: 'ETIMEDOUT', retries: 2 },
        keyworker: 'UP',
        tokenverification: 'UP',
        whereabouts: 'UP',
      })
    })
  })
})
