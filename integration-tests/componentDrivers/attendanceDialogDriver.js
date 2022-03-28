module.exports = cy => {
  const markAsPaidAbsence = () =>
    cy.get('.ReactModalPortal form').within(_ => {
      cy.get('input[name="pay"]').check('yes')
      cy.get('select[name="absentReason"]').select('AcceptableAbsence')
      cy.get('textarea[name="comments"]').type('test')
      cy.get('button[name="confirm"]').click()
    })
  return {
    markAsPaidAbsence,
  }
}
