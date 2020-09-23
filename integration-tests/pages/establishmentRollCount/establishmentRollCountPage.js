const page = require('../page')

const establishmentRollCountPage = () =>
  page('Establishment roll', {
    values: () => cy.get('.block-figure__value'),
  })

export default {
  verifyOnPage: establishmentRollCountPage,
}
