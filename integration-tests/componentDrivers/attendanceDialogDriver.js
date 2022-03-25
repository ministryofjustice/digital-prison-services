module.exports = (cy) => {
  const markAbsence = ({ pay, absentReason, absentSubReason, comments = 'test' }) =>
    cy.get('.ReactModalPortal form').within((_) => {
      cy.get('input[name="pay"]').check(pay)
      if (absentReason) cy.get('select[name="absentReason"]').select(absentReason)
      if (absentSubReason) cy.get('select[name="absentSubReason"]').select(absentSubReason)
      cy.get('textarea[name="comments"]').type(comments)
      cy.get('button[name="confirm"]').click()
    })
  return {
    markAbsence,
  }
}
