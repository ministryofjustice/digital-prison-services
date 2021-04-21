const whereaboutsTasks = prisonName => [
  {
    id: 'search-for-prisoner',
    heading: 'Search for a prisoner',
    description: 'Change someone’s cell after searching for them using their name or prison number.',
    href: '/change-someones-cell/prisoner-search',
    roles: null,
    enabled: true,
  },
  {
    id: 'view-residential-location',
    heading: 'View residential location',
    description: 'View all prisoners in a residential location. You can view their cell history and change their cell.',
    href: '/change-someones-cell/view-residential-location',
    roles: null,
    enabled: true,
  },
  {
    id: 'create-space',
    heading: 'Move someone temporarily out of a cell',
    description:
      'Create a space for another prisoner by moving someone out of a cell temporarily. You will need to allocate a cell to them later.',
    href: '/change-someones-cell/temporary-move',
    roles: null,
    enabled: true,
  },
  {
    id: 'view-history',
    heading: 'View 7 day cell move history',
    description: `View all cell moves completed over the last 7 days in ${prisonName}.`,
    href: '/change-someones-cell/recent-cell-moves',
    roles: null,
    enabled: true,
  },
  {
    id: 'no-cell-allocated',
    heading: 'No cell allocated',
    description: 'View people who do not currently have a cell allocated having been temporarily moved out of a cell.',
    href: '/establishment-roll/no-cell-allocated',
    roles: null,
    enabled: true,
  },
]

module.exports = oauthApi => async (req, res) => {
  const { activeCaseLoad } = res.locals.user
  const userRoles = await oauthApi.userRoles(res.locals)

  const canViewCellMoveButton = userRoles?.some(role => role.roleCode === 'CELL_MOVE')

  if (canViewCellMoveButton) {
    return res.render('cellMove/cellMoveHomepage', {
      tasks: whereaboutsTasks(activeCaseLoad.description)
        .filter(task => task.enabled)
        .map(({ roles, enabled, ...task }) => task),
    })
  }

  return res.render('notFound', { url: '/' })
}
