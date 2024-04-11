import { hasAnyRole } from '../../shared/permissions'

import config from '../../config'

const {
  applications: { licences, manageaccounts, moic, pecs, sendLegalMail },
  apis: {
    omic,
    useOfForce,
    pathfinder,
    categorisation,
    soc,
    pinPhones,
    manageAdjudications,
    managePrisonVisits,
    legacyPrisonVisits,
    secureSocialVideoCalls,
    welcomePeopleIntoPrison,
    mercurySubmit,
    imsService,
    manageRestrictedPatients,
    checkMyDiary,
    incentives,
    createAndVaryALicence,
    activities,
    appointments,
    historicalPrisonerApplication,
    getSomeoneReadyForWork,
    learningAndWorkProgress,
    manageOffences,
    prepareSomeoneForRelease,
  },
  app: { whereaboutsMaintenanceMode, keyworkerMaintenanceMode, covidUnitsEnabled },
} = config

const getTasks = ({ activeCaseLoadId, locations, staffId, whereaboutsConfig, keyworkerPrisonStatus, roleCodes }) => {
  const userHasRoles = (roles) => hasAnyRole(roleCodes, roles)

  const isMercurySubmitLive = () => {
    return mercurySubmit.liveDate && mercurySubmit.liveDate < Date.now()
  }

  const isImsServiceLive = () => {
    return imsService.liveDate && imsService.liveDate < Date.now()
  }

  const getAdjudicationsEnabledPrisons = (adjudicationsEnabledPrisons) => {
    // if the input is an empty array, then turn enable for all prisons
    if (Array.isArray(adjudicationsEnabledPrisons) && adjudicationsEnabledPrisons.length === 0) return true
    // else split the input string and see if the active caseload is included
    return adjudicationsEnabledPrisons.split(',').includes(activeCaseLoadId)
  }

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
      heading: 'Prisoner whereabouts',
      description: 'View unlock lists, all appointments, manage attendance and add bulk appointments.',
      href: '/manage-prisoner-whereabouts',
      roles: null,
      enabled: () =>
        whereaboutsConfig?.enabled &&
        !activities.enabled_prisons.split(',').includes(activeCaseLoadId) &&
        !appointments.enabled_prisons.split(',').includes(activeCaseLoadId),
    },
    {
      id: 'change-someones-cell',
      heading: 'Change someone’s cell',
      description: 'Complete a cell move and view the 7 day history of all cell moves completed in your establishment.',
      href: '/change-someones-cell',
      enabled: () => userHasRoles(['CELL_MOVE']),
    },
    {
      id: 'check-my-diary',
      heading: 'Check my diary',
      description: 'View your prison staff detail (staff rota) from home.',
      href: checkMyDiary.ui_url,
      roles: null,
      enabled: () => checkMyDiary.ui_url,
    },
    {
      id: 'incentives',
      heading: 'Incentives',
      description: 'Manage incentive level reviews by residential location and view incentives data charts.',
      href: incentives.ui_url,
      roles: null,
      enabled: () => incentives.ui_url && (userHasRoles(['MAINTAIN_INCENTIVE_LEVELS']) || locations?.length > 0),
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
          'PF_ADMIN',
          'PF_USER',
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
      heading: 'Home Detention Curfew',
      description: 'Create and manage Home Detention Curfew.',
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
      heading: 'Key workers',
      description: 'Add and remove key workers from prisoners and manage individuals.',
      href: omic.url,
      enabled: () => {
        if (keyworkerMaintenanceMode) {
          return false
        }
        if (!keyworkerPrisonStatus?.migrated) return userHasRoles(['KW_MIGRATION'])
        return userHasRoles(['OMIC_ADMIN', 'KEYWORKER_MONITOR'])
      },
    },
    {
      id: 'pom',
      heading: 'View POM cases',
      description: 'Keep track of your allocations. If you allocate cases, you also can do that here.',
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
      heading: 'Prisoner communication monitoring service',
      description: 'Access to the Prisoner communication monitoring service.',
      href: pinPhones.ui_url,
      enabled: () =>
        pinPhones.ui_url &&
        userHasRoles(['PCMS_ANALYST', 'PCMS_AUTHORISING_OFFICER', 'PCMS_GLOBAL_ADMIN', 'PCMS_AUDIT']),
    },
    {
      id: 'manage-adjudications',
      heading: 'Adjudications',
      description: 'Place a prisoner on report after an incident, view reports and manage adjudications.',
      href: manageAdjudications.ui_url,
      enabled: () => manageAdjudications.ui_url && getAdjudicationsEnabledPrisons(manageAdjudications.enabled_prisons),
    },
    {
      id: 'book-a-prison-visit',
      heading: 'Manage prison visits',
      description: 'Book, view and cancel a prisoner’s social visits.',
      href: managePrisonVisits.ui_url,
      enabled: () => managePrisonVisits.ui_url && userHasRoles(['MANAGE_PRISON_VISITS']),
    },
    {
      id: 'legacy-prison-visit',
      heading: 'Online visit requests',
      description: 'Respond to online social visit requests.',
      href: legacyPrisonVisits.ui_url,
      enabled: () => legacyPrisonVisits.ui_url && userHasRoles(['PVB_REQUESTS']),
    },
    {
      id: 'secure-social-video-calls',
      heading: 'Secure social video calls',
      description:
        'Manage and monitor secure social video calls with prisoners. Opens the Prison Video Calls application.',
      href: secureSocialVideoCalls.ui_url,
      enabled: () => secureSocialVideoCalls.ui_url && userHasRoles(['SOCIAL_VIDEO_CALLS']),
    },
    {
      id: 'check-rule39-mail',
      heading: 'Check Rule 39 mail',
      description: 'Scan barcodes on mail from law firms and other approved senders.',
      href: sendLegalMail.url,
      enabled: () => sendLegalMail.url && userHasRoles(['SLM_SCAN_BARCODE', 'SLM_ADMIN']),
    },
    {
      id: 'welcome-people-into-prison',
      heading: 'Welcome people into prison',
      description:
        'View prisoners booked to arrive today, add them to the establishment roll, and manage reception tasks for recent arrivals.',
      href: welcomePeopleIntoPrison.url,
      roles: null,
      enabled: () =>
        welcomePeopleIntoPrison.url && welcomePeopleIntoPrison.enabled_prisons.split(',').includes(activeCaseLoadId),
    },
    {
      id: isMercurySubmitLive() ? 'submit-an-intelligence-report' : 'submit-an-intelligence-report-private-beta',
      heading: isMercurySubmitLive() ? 'Submit an Intelligence Report' : 'Submit an Intelligence Report (Private Beta)',
      description: isMercurySubmitLive()
        ? 'Access to the new Mercury submission form'
        : 'Access to the new Mercury submission form for those establishments enrolled in the private beta',
      href: mercurySubmit.url,
      roles: null,
      enabled: () =>
        mercurySubmit.url &&
        (isMercurySubmitLive() ||
          (mercurySubmit.privateBetaDate &&
            mercurySubmit.privateBetaDate < Date.now() &&
            mercurySubmit.enabled_prisons.split(',').includes(activeCaseLoadId))),
    },
    {
      id: isImsServiceLive() ? 'manage-intelligence' : 'manage-intelligence',
      heading: isImsServiceLive() ? 'Manage Intelligence' : 'Manage Intelligence (Private Beta)',
      description: isImsServiceLive()
        ? 'Access to the new IMS Service form'
        : 'Access to the new IMS Service form for those establishments enrolled in the private beta',
      href: imsService.url,
      roles: null,
      enabled: () =>
        imsService.url &&
        (isImsServiceLive() ||
          (imsService.privateBetaDate &&
            imsService.privateBetaDate < Date.now() &&
            imsService.enabled_prisons.split(',').includes(activeCaseLoadId))),
    },
    {
      id: 'manage-restricted-patients',
      heading: 'Manage restricted patients',
      description:
        'View your restricted patients, move someone to a secure hospital, or remove someone from the restricted patients service.',
      href: manageRestrictedPatients.ui_url,
      enabled: () =>
        manageRestrictedPatients.ui_url &&
        userHasRoles([
          'SEARCH_RESTRICTED_PATIENT',
          'TRANSFER_RESTRICTED_PATIENT',
          'REMOVE_RESTRICTED_PATIENT',
          'RESTRICTED_PATIENT_MIGRATION',
        ]),
    },
    {
      id: 'create-and-vary-a-licence',
      heading: 'Create and vary a licence',
      description: 'Create and vary standard determinate licences and post sentence supervision orders.',
      href: createAndVaryALicence.url,
      enabled: () =>
        createAndVaryALicence.url &&
        createAndVaryALicence.enabled_prisons.split(',').includes(activeCaseLoadId) &&
        userHasRoles(['LICENCE_CA', 'LICENCE_DM', 'LICENCE_RO', 'LICENCE_ACO', 'LICENCE_ADMIN']),
    },
    {
      id: 'activities',
      heading: 'Allocate people, unlock and attend',
      description:
        'Create and edit activities. Log applications and manage waitlists. Allocate people and edit allocations. Print unlock lists and record attendance.',
      href: activities.url,
      enabled: () => activities.url && activities.enabled_prisons.split(',').includes(activeCaseLoadId),
    },
    {
      id: 'appointments',
      heading: 'Schedule and edit appointments, and record attendance',
      description: 'Create and manage appointments. Print movement slips. Record attendance.',
      href: appointments.url,
      enabled: () => appointments.url && appointments.enabled_prisons.split(',').includes(activeCaseLoadId),
    },
    {
      id: 'view-people-due-to-leave',
      heading: 'People due to leave',
      description: 'View people due to leave this establishment for court appearances, transfers or being released.',
      href: '/manage-prisoner-whereabouts/scheduled-moves',
      enabled: () =>
        activities.enabled_prisons.split(',').includes(activeCaseLoadId) &&
        appointments.enabled_prisons.split(',').includes(activeCaseLoadId),
    },
    {
      id: 'view-covid-units',
      heading: 'View COVID units',
      description: 'View who is in each COVID unit in your establishment.',
      href: '/current-covid-units',
      enabled: () =>
        covidUnitsEnabled &&
        userHasRoles(['PRISON']) &&
        activities.enabled_prisons.split(',').includes(activeCaseLoadId) &&
        appointments.enabled_prisons.split(',').includes(activeCaseLoadId),
    },
    {
      id: 'historical-prisoner-application',
      heading: 'Historical Prisoner Application',
      description: 'This service allows users to view historical prisoner information.',
      href: historicalPrisonerApplication.ui_url,
      enabled: () => historicalPrisonerApplication.ui_url && userHasRoles(['HPA_USER']),
    },
    {
      id: 'get-someone-ready-to-work',
      heading: 'Get someone ready to work',
      description: 'Record what support a prisoner needs to get work. View who has been assessed as ready to work.',
      href: `${getSomeoneReadyForWork.ui_url}?sort=releaseDate&order=descending`,
      enabled: () => getSomeoneReadyForWork.ui_url && userHasRoles(['WORK_READINESS_VIEW', 'WORK_READINESS_EDIT']),
    },
    {
      id: 'learning-and-work-progress',
      heading: 'Learning and work progress',
      description: 'View and manage learning and work history, support needs, goals and progress.',
      href: learningAndWorkProgress.ui_url,
      enabled: () =>
        learningAndWorkProgress.ui_url && userHasRoles(['EDUCATION_WORK_PLAN_EDITOR', 'EDUCATION_WORK_PLAN_VIEWER']),
    },
    {
      id: 'manage-offences',
      heading: 'Manage offences',
      description: 'This service allows you to maintain offence reference data.',
      href: manageOffences.ui_url,
      enabled: () => userHasRoles(['MANAGE_OFFENCES_ADMIN', 'UPDATE_OFFENCE_SCHEDULES', 'NOMIS_OFFENCE_ACTIVATOR']),
    },
    {
      id: 'prepare-someone-for-release',
      heading: 'Prepare someone for release',
      description: 'Search for people with resettlement needs. View and manage their information and support.',
      href: prepareSomeoneForRelease.ui_url,
      enabled: () => prepareSomeoneForRelease.ui_url && userHasRoles(['RESETTLEMENT_PASSPORT_EDIT']),
    },
  ]
}

export default ({ oauthApi, prisonApi, whereaboutsApi, keyworkerApi, logError }) =>
  async (req, res) => {
    try {
      const { activeCaseLoadId, staffId } = req.session.userDetails
      const userRoles = oauthApi.userRoles(res.locals)
      const [locations, staffRoles] = await Promise.all([
        prisonApi.userLocations(res.locals),
        prisonApi.getStaffRoles(res.locals, staffId, activeCaseLoadId),
      ])

      let whereaboutsConfig
      if (whereaboutsMaintenanceMode) {
        whereaboutsConfig = { enabled: false }
      } else {
        whereaboutsConfig = await whereaboutsApi.getWhereaboutsConfig(res.locals, activeCaseLoadId).catch(() => null)
      }

      let keyworkerPrisonStatus
      if (keyworkerMaintenanceMode) {
        keyworkerPrisonStatus = {} // this can be empty because we're using the feature flag in getTasks
      } else {
        keyworkerPrisonStatus = await keyworkerApi.getPrisonMigrationStatus(res.locals, activeCaseLoadId)
      }

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
