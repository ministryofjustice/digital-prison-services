export default (headerText, pageObject = {}) => {
  const checkOnPage = () => cy.get('h1').contains(headerText)
  checkOnPage()
  return { ...pageObject, checkStillOnPage: checkOnPage }
}
