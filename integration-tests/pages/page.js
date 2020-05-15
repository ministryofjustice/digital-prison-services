export default (name, pageObject = {}) => {
  const checkOnPage = () => cy.get('h1').contains(name)
  checkOnPage()
  return { ...pageObject, checkStillOnPage: checkOnPage }
}
