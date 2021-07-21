import moment from 'moment'
import { documentToHtmlString } from '@contentful/rich-text-html-renderer'
import { BLOCKS, MARKS, INLINES } from '@contentful/rich-text-types'

const options = {
  renderMark: {
    [MARKS.BOLD]: (text) => `<strong>${text}</strong>`,
  },
  renderNode: {
    [BLOCKS.HEADING_2]: (node, next) => `<h2 class="govuk-heading-m">${next(node.content)}</h2>`,
    [BLOCKS.HEADING_3]: (node, next) => `<h3 class="govuk-heading-s">${next(node.content)}</h3>`,
    [BLOCKS.UL_LIST]: (node, next) => `<ul class="govuk-list govuk-list--bullet">${next(node.content)}</ul>`,
    [BLOCKS.PARAGRAPH]: (node, next) => `<p class="govuk-body">${next(node.content)}</p>`,
    [INLINES.HYPERLINK]: (node, next) => `<a class="govuk-link" href="${node.data.uri}">${next(node.content)}</a>`,
  },
}

export default ({ contentfulClient, notificationCookie }) => {
  const getMostRecentNotificationAsHtml = async (req) => {
    const response = await contentfulClient.getEntries({
      content_type: 'notification',
      order: '-sys.updatedAt',
    })

    if (!response.items?.length) return null

    const latestNotification = response.items[0]

    const {
      sys: { id, revision },
      fields: { body, expiryTime },
    } = latestNotification

    if (expiryTime && moment().isAfter(moment(expiryTime), 'day')) return null
    if (notificationCookie.alreadyDismissed(req, { id, revision })) return null

    return {
      id,
      revision,
      content: documentToHtmlString(body, options),
    }
  }

  const getPagesAsHtml = async (path) => {
    const response = await contentfulClient.getEntries({
      content_type: 'pages',
      'fields.path': path,
    })

    if (!response.items?.length) return null

    const { body, title } = response.items[0].fields
    return { title, content: documentToHtmlString(body, options) }
  }

  return {
    getMostRecentNotificationAsHtml,
    getPagesAsHtml,
  }
}
