context('Ping response correctly', () => {
  it('Returns pong', () => {
    cy.request('/ping').then(response => {
      expect(response.body).to.equal('pong')
    })
  })
})
