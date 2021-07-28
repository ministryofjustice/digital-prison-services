import { hasAnyRole } from '../../shared/permissions'

import config from '../../config'

const {
  applications: { licences, manageaccounts, moic, pecs },
  apis: { omic, useOfForce, pathfinder, categorisation, soc, pinPhones },
} = config

const getTasks = ({ activeCaseLoadId, locations, staffId, whereaboutsConfig, keyworkerPrisonStatus, roleCodes }) => {
  const userHasRoles = (roles) => hasAnyRole(roleCodes, roles)

  return [
    {
      id: 'global-search',
      heading: 'Global search',
      description: 'Search for someone in any establishment, or who has been released.',
      href: '/global-search',
      enabled: () => userHasRoles(['GLOBAL_SEARCH']),
    },
    {
      id: 'key-worker-allocations',
      heading: 'My key worker allocation',
      description: 'View your key worker cases.',
      href: `${omic.url}/key-worker/${staffId}`,
      enabled: () => omic.url && userHasRoles(['KW']),
    },
    {
      id: 'manage-prisoner-whereabouts',
      heading: 'Manage prisoner whereabouts',
      description: 'View unlock lists, all appointments and COVID units, manage attendance and add bulk appointments.',
      href: '/manage-prisoner-whereabouts',
      roles: null,
      enabled: () => whereaboutsConfig?.enabled,
    },
    {
      id: 'change-someones-cell',
      heading: 'Change someone’s cell',
      description: 'Complete a cell move and view the 7 day history of all cell moves completed in your establishment.',
      href: '/change-someones-cell',
      enabled: () => userHasRoles(['CELL_MOVE']),
    },
    {
      id: 'use-of-force',
      heading: 'Use of force incidents',
      description: 'Manage and view incident reports and statements.',
      href: useOfForce.ui_url,
      roles: null,
      enabled: () => useOfForce.ui_url && useOfForce.prisons.split(',').includes(activeCaseLoadId),
    },
    {
      id: 'pathfinder',
      heading: 'Pathfinder',
      description: 'Manage your Pathfinder caseloads.',
      href: pathfinder.ui_url,
      enabled: () =>
        pathfinder.ui_url &&
        userHasRoles([
          'PF_STD_PRISON',
          'PF_STD_PROBATION',
          'PF_APPROVAL',
          'PF_STD_PRISON_RO',
          'PF_STD_PROBATION_RO',
          'PF_POLICE',
          'PF_HQ',
          'PF_PSYCHOLOGIST',
          'PF_NATIONAL_READER',
          'PF_LOCAL_READER',
        ]),
    },
    {
      id: 'hdc-licences',
      heading: 'HDC and licences',
      description: 'Create and manage Home Detention Curfew and licences.',
      href: licences.url,
      enabled: () =>
        licences.url &&
        userHasRoles(['NOMIS_BATCHLOAD', 'LICENCE_CA', 'LICENCE_DM', 'LICENCE_RO', 'LICENCE_VARY', 'LICENCE_READONLY']),
    },
    {
      id: 'establishment-roll',
      heading: 'Establishment roll check',
      description: 'View the roll broken down by residential unit and see who is arriving and leaving.',
      href: '/establishment-roll',
      roles: null,
      enabled: () => Boolean(locations?.length > 0),
    },
    {
      id: 'manage-key-workers',
      heading: 'Manage key workers',
      description: 'Add and remove key workers from prisoners and manage individuals.',
      href: omic.url,
      enabled: () => {
        if (!keyworkerPrisonStatus?.migrated) return userHasRoles(['KW_MIGRATION'])
        return userHasRoles(['OMIC_ADMIN', 'KEYWORKER_MONITOR'])
      },
    },
    {
      id: 'pom',
      heading: 'Manage Prison Offender Managers’ cases',
      description: 'Allocate a Prison Offender Manager (POM) to a prisoner and manage their cases.',
      href: moic.url,
      enabled: () => moic.url && userHasRoles(['ALLOC_MGR', 'ALLOC_CASE_MGR']),
    },
    {
      id: 'manage-users',
      heading: 'Manage user accounts',
      description:
        'As a Local System Administrator (LSA) or administrator, manage accounts and groups for service users.',
      href: manageaccounts.url,
      enabled: () =>
        manageaccounts.url &&
        userHasRoles([
          'MAINTAIN_ACCESS_ROLES',
          'MAINTAIN_ACCESS_ROLES_ADMIN',
          'MAINTAIN_OAUTH_USERS',
          'AUTH_GROUP_MANAGER',
        ]),
    },
    {
      id: 'categorisation',
      heading: 'Categorisation',
      description: 'View a prisoner’s category and complete either a first time categorisation or a recategorisation.',
      href: categorisation.ui_url,
      enabled: () =>
        categorisation.ui_url &&
        userHasRoles([
          'CREATE_CATEGORISATION',
          'CREATE_RECATEGORISATION',
          'APPROVE_CATEGORISATION',
          'CATEGORISATION_SECURITY',
        ]),
    },
    {
      id: 'secure-move',
      heading: 'Book a secure move',
      description:
        'Schedule secure movement for prisoners in custody, via approved transport suppliers, between locations across England and Wales.',
      href: pecs.url,
      enabled: () => pecs.url && userHasRoles(['PECS_OCA', 'PECS_PRISON']),
    },
    {
      id: 'soc',
      heading: 'Manage SOC cases',
      description: 'Manage your Serious and Organised Crime (SOC) caseload.',
      href: soc.ui_url,
      enabled: () => soc.ui_url && userHasRoles(['SOC_CUSTODY', 'SOC_COMMUNITY', 'SOC_HQ']),
    },
    {
      id: 'pin-phones',
      heading: 'Pin phone service',
      description: 'Access to the pin phone service.',
      href: pinPhones.ui_url,
      enabled: () => pinPhones.ui_url && userHasRoles(['PPM_ANALYST', 'PPM_AUTHORISING_OFFICER', 'PPM_GLOBAL_ADMIN']),
    },
  ]
}

export default ({ oauthApi, prisonApi, whereaboutsApi, keyworkerApi, logError }) =>
  async (req, res) => {
    try {
      const { activeCaseLoadId, staffId } = req.session.userDetails
      const [locations, staffRoles, userRoles, whereaboutsConfig, keyworkerPrisonStatus] = await Promise.all([
        prisonApi.userLocations(res.locals),
        prisonApi.getStaffRoles(res.locals, staffId, activeCaseLoadId),
        oauthApi.userRoles(res.locals),
        whereaboutsApi.getWhereaboutsConfig(res.locals, activeCaseLoadId).catch(() => null),
        keyworkerApi.getPrisonMigrationStatus(res.locals, activeCaseLoadId),
      ])

      const roleCodes = [
        ...userRoles.map((userRole) => userRole.roleCode),
        ...staffRoles.map((staffRole) => staffRole.role),
      ]

      if (roleCodes.includes('VIDEO_LINK_COURT_USER')) return res.redirect('/videolink')

      const allTasks = getTasks({
        activeCaseLoadId,
        locations,
        staffId,
        whereaboutsConfig,
        keyworkerPrisonStatus,
        roleCodes,
      })

      return res.render('homepage/homepage.njk', {
        locationOptions: locations?.map((option) => ({ value: option.locationPrefix, text: option.description })),
        tasks: allTasks
          .filter((task) => task.enabled())
          .map((task) => ({
            id: task.id,
            href: task.href,
            heading: task.heading,
            description: task.description,
          })),
      })
    } catch (error) {
      if (error) logError(req.originalUrl, error, 'Home page not loading')

      return res.render('error.njk', { url: '/' })
    }
  }
