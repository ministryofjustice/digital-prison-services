const {
  apis: { omic },
} = require('../../config')

const tasks = () => [
  {
    id: 'global-search',
    text: 'Global search',
    subText: 'Search for someone in any establishment, or who has been released.',
    linkUrl: '/global-search',
    roles: ['GLOBAL_SEARCH'],
  },
  {
    id: 'manage-key-workers',
    text: 'Manage key workers',
    linkUrl: omic.url,
    roles: ['OMIC_ADMIN', 'KEYWORKER_MONITOR'],
  },
]

const copy = ({ propsToIgnore, value }) => {
  if (!value) return value
  const props = Object.keys(value).filter(entry => !propsToIgnore.includes(entry))
  return props.reduce((acc, current) => ({ ...{ [current]: value[current], ...acc } }), {})
}

module.exports = ({ oauthApi }) => async (req, res) => {
  const userRoles = await oauthApi.userRoles(res.locals)
  const roleCodes = userRoles.map(role => role.roleCode)

  const filteredTasks = tasks()
    .filter(task => Boolean(task.roles.find(role => roleCodes.includes(role))))
    .map(task => copy({ propsToIgnore: ['roles'], value: task }))
    .filter(Boolean)
    .sort((left, right) => left.text.localeCompare(right.text))

  return res.render('homePage/homePage.njk', {
    tasks: filteredTasks,
  })
}
