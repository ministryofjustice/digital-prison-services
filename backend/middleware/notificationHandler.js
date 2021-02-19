const moment = require('moment')
const { INLINES, MARKS } = require('@contentful/rich-text-types')
const { documentToHtmlString } = require('@contentful/rich-text-html-renderer')

const options = {
  renderMark: {
    [MARKS.BOLD]: text => `<p class="govuk-!-font-weight-bold">${text}</p>`,
    [MARKS.ITALIC]: text => `<em>${text}</em>`,
  },
  renderNode: {
    [INLINES.HYPERLINK]: (node, next) => {
      // Update to @govuk-react/link when out of Alpha
      return `<a class="link" href="${node.data.uri}">
        ${next(node.content)}
      </a>`
    },
  },
}

module.exports = ({ contentfulClient, logError, notificationCookie }) => async (req, res, next) => {
  try {
    const entries = await contentfulClient.getEntries({
      content_type: 'notification',
      order: '-sys.updatedAt',
    })

    const latestNotification = entries && entries.total ? entries.items[0] : undefined

    const {
      sys: { id, revision },
      fields: { body, expiryTime },
    } = latestNotification

    if (expiryTime && moment().isAfter(moment(expiryTime), 'day')) return next()
    if (notificationCookie.alreadyDismissed(req, { id, revision })) return next()

    res.locals.notification = {
      id,
      revision,
      content: documentToHtmlString(body, options),
    }
  } catch (e) {
    logError(req.originalUrl, e, 'Error loading contentful content')
  }

  return next()
}
