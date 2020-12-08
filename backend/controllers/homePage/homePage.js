const {
  applications: { licences, manageaccounts, moic, pecs },
  apis: { omic, useOfForce, pathfinder, categorisation, soc },
} = require('../../config')

const getTasks = ({ activeCaseLoadId, locations, staffId, whereaboutsConfig }) => [
  {
    id: 'global-search',
    text: 'Global search',
    subText: 'Search for someone in any establishment, or who has been released.',
    linkUrl: '/global-search',
    roles: ['GLOBAL_SEARCH'],
    enabled: true,
  },
  {
    id: 'key-worker-allocations',
    text: 'My key worker allocation',
    subText: 'View your key worker cases.',
    linkUrl: `${omic.url}/key-worker/${staffId}`,
    roles: ['KW'],
    enabled: omic.url,
  },
  {
    id: 'manage-prisoner-whereabouts',
    text: 'Manage prisoner whereabouts',
    subText: 'View unlock lists and manage attendance.',
    linkUrl: '/manage-prisoner-whereabouts',
    roles: null,
    enabled: whereaboutsConfig?.enabled,
  },
  {
    id: 'covid-units',
    text: 'View COVID units',
    subText: 'View who in your establishment is in each COVID unit.',
    linkUrl: '/current-covid-units',
    roles: ['PRISON'],
    enabled: true,
  },
  {
    id: 'use-of-force',
    text: 'Use of force incidents',
    subText: 'Manage and view incident reports and statements.',
    linkUrl: useOfForce.ui_url,
    roles: null,
    enabled: useOfForce.ui_url && useOfForce.prisons.split(',').includes(activeCaseLoadId),
  },
  {
    id: 'pathfinder',
    text: 'Pathfinder',
    subText: 'Manage your Pathfinder caseloads.',
    linkUrl: pathfinder.ui_url,
    roles: [
      'PF_STD_PRISON',
      'PF_STD_PROBATION',
      'PF_APPROVAL',
      'PF_STD_PRISON_RO',
      'PF_STD_PROBATION_RO',
      'PF_POLICE',
      'PF_HQ',
      'PF_PSYCHOLOGIST',
    ],
    enabled: pathfinder.ui_url,
  },
  {
    id: 'hdc-licences',
    text: 'HDC and licences',
    subText: 'Create and manage Home Detention Curfew and licences.',
    linkUrl: licences.url,
    roles: ['NOMIS_BATCHLOAD', 'LICENCE_CA', 'LICENCE_DM', 'LICENCE_RO', 'LICENCE_VARY', 'LICENCE_READONLY'],
    enabled: licences.url,
  },
  {
    id: 'establishment-roll',
    text: 'Establishment roll check',
    subText: 'View the roll broken down by residential unit and see who is arriving and leaving.',
    linkUrl: '/establishment-roll',
    roles: null,
    enabled: Boolean(locations?.length > 0),
  },
  {
    id: 'bulk-appointments',
    text: 'Add bulk appointments',
    subText: 'Upload a file to add appointments for multiple prisoners.',
    linkUrl: '/bulk-appointments/need-to-upload-file',
    roles: ['BULK_APPOINTMENTS'],
    enabled: true,
  },
  {
    id: 'manage-key-workers',
    text: 'Key worker management service',
    subText: 'Add and remove key workers from prisoners and manage individuals.',
    linkUrl: omic.url,
    roles: ['OMIC_ADMIN', 'KEYWORKER_MONITOR'],
    enabled: omic.url,
  },
  {
    id: 'manage-users',
    text: 'Manage user accounts',
    subText: 'As a Local System Administrator (LSA) or administrator, manage accounts and groups for service users.',
    linkUrl: manageaccounts.url,
    roles: ['MAINTAIN_ACCESS_ROLES', 'MAINTAIN_ACCESS_ROLES_ADMIN', 'MAINTAIN_OAUTH_USERS', 'AUTH_GROUP_MANAGER'],
    enabled: manageaccounts.url,
  },
  {
    id: 'categorisation',
    text: 'Categorisation',
    subText: 'View a prisoner’s category and complete either an first time categorisation or a recategorisation.',
    linkUrl: categorisation.ui_url,
    roles: ['CREATE_CATEGORISATION', 'CREATE_RECATEGORISATION', 'APPROVE_CATEGORISATION', 'CATEGORISATION_SECURITY'],
    enabled: categorisation.ui_url,
  },
  {
    id: 'secure-move',
    text: 'Book a secure move',
    subText:
      'Schedule secure movement for prisoners in custody, via approved transport suppliers, between locations across England and Wales.',
    linkUrl: pecs.url,
    roles: ['PECS_OCA', 'PECS_PRISON'],
    enabled: pecs.url,
  },
  {
    id: 'pom',
    text: 'Manage Prison Offender Managers’ cases',
    subText: 'Allocate a Prison Offender Manager (POM) to a prisoner and manage their cases.',
    linkUrl: moic.url,
    roles: ['ALLOC_MGR', 'ALLOC_CASE_MGR'],
    enabled: moic.url,
  },
  {
    id: 'soc',
    text: 'Manage SOC cases',
    subText: 'Manage your Serious and Organised Crime (SOC) caseload.',
    linkUrl: soc.url,
    roles: ['SOC_CUSTODY', 'SOC_COMMUNITY'],
    enabled: soc.url,
  },
]

module.exports = ({ oauthApi, prisonApi, whereaboutsApi, logError }) => async (req, res) => {
  try {
    const { activeCaseLoadId, staffId } = req.session.userDetails
    const [locations, staffRoles, userRoles, whereaboutsConfig] = await Promise.all([
      prisonApi.userLocations(res.locals),
      prisonApi.getStaffRoles(res.locals, staffId, activeCaseLoadId),
      oauthApi.userRoles(res.locals),
      whereaboutsApi.getWhereaboutsConfig(res.locals, activeCaseLoadId),
    ])

    const roleCodes = [...userRoles.map(userRole => userRole.roleCode), ...staffRoles.map(staffRole => staffRole.role)]

    return res.render('homePage/homePage.njk', {
      locationOptions: locations?.map(option => ({ value: option.locationPrefix, text: option.description })),
      tasks: getTasks({ activeCaseLoadId, locations, staffId, whereaboutsConfig })
        .filter(
          task => Boolean(task.roles === null || task.roles.find(role => roleCodes.includes(role))) && task.enabled
        )
        .map(({ roles, enabled, ...task }) => task)
        .sort((left, right) => left.text.localeCompare(right.text)),
    })
  } catch (error) {
    if (error) logError(req.originalUrl, error, 'Home page not loading')

    return res.render('error.njk', { url: '/' })
  }
}
