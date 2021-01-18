const { documentToHtmlString } = require('@contentful/rich-text-html-renderer')
const { BLOCKS, MARKS, INLINES } = require('@contentful/rich-text-types')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../config')
const contentfulClient = require('../contentfulClient')

const options = {
  renderMark: {
    [MARKS.BOLD]: text => `<strong>${text}</strong>`,
  },
  renderNode: {
    [BLOCKS.HEADING_2]: (node, next) => `<h2 class="govuk-heading-m">${next(node.content)}</h2>`,
    [BLOCKS.HEADING_3]: (node, next) => `<h3 class="govuk-heading-s">${next(node.content)}</h3>`,
    [BLOCKS.UL_LIST]: (node, next) => `<ul class="govuk-list govuk-list--bullet">${next(node.content)}</ul>`,
    [BLOCKS.PARAGRAPH]: (node, next) => `<p class="govuk-body">${next(node.content)}</p>`,
    [INLINES.HYPERLINK]: (node, next) => `<a class="govuk-link" href="${node.data.uri}">${next(node.content)}</a>`,
  },
}

module.exports = () => async (req, res) => {
  const { path } = req.params

  const notFound = () => res.render('notFound.njk', { url: dpsUrl })

  if (!path) return notFound()

  const response = await contentfulClient.getEntries({
    content_type: 'pages',
    'fields.path': path,
  })

  if (response.items.length === 0) return notFound()

  const { body, title } = response.items[0].fields
  const content = documentToHtmlString(body, options)

  return res.render('content.njk', { content, dpsUrl, title })
}
