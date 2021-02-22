const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../config')

module.exports = ({ contentfulService }) => async (req, res) => {
  const { path } = req.params

  const notFound = () => res.render('notFound.njk', { url: dpsUrl })

  if (!path) return notFound()

  const pageContent = await contentfulService.getPagesAsHtml(path)

  if (!pageContent) return notFound()

  const { title, content } = pageContent

  return res.render('content.njk', { content, dpsUrl, title })
}
