import express from 'express'
import nunjucks from 'nunjucks'
import EsweService from '../services/esweService'
import telemetry from '../azure-appinsights'
import prisonerQuickLook from '../controllers/prisonerProfile/prisonerQuickLook'
import prisonerFullImage from '../controllers/prisonerProfile/prisonerFullImage'
import prisonerPersonal from '../controllers/prisonerProfile/prisonerPersonal'
import prisonerAlerts from '../controllers/prisonerProfile/prisonerAlerts'
import prisonerCaseNotes from '../controllers/prisonerProfile/prisonerCaseNotes'
import prisonerSentenceAndRelease from '../controllers/prisonerProfile/prisonerSentenceAndRelease'
import prisonerVisits from '../controllers/prisonerProfile/prisonerVisits'
import prisonerSchedule from '../controllers/prisonerProfile/prisonerSchedule'
import prisonerProfessionalContacts from '../controllers/prisonerProfile/prisonerProfessionalContacts'
import prisonerCellHistory from '../controllers/prisonerProfile/prisonerCellHistory'
import prisonerLocationHistory from '../controllers/prisonerProfile/prisonerLocationHistory'
import prisonerCsraHistory from '../controllers/prisonerProfile/prisonerCsraHistory'
import prisonerCsraReview from '../controllers/prisonerProfile/prisonerCsraReview'
import prisonerWorkAndSkills from '../controllers/prisonerProfile/prisonerWorkAndSkills'
import prisonerDamageObligations from '../controllers/prisonerProfile/prisonerFinances/prisonerDamageObligations'
import prisonerPrivateCash from '../controllers/prisonerProfile/prisonerFinances/prisonerPrivateCash'
import prisonerSpends from '../controllers/prisonerProfile/prisonerFinances/prisonerSpends'
import prisonerSavings from '../controllers/prisonerProfile/prisonerFinances/prisonerSavings'
import prisonerProfileServiceFactory from '../services/prisonerProfileService'
import prisonerFinanceServiceFactory from '../services/prisonerFinanceService'
import personServiceFactory from '../services/personService'
import paginationService from '../services/paginationService'
import referenceCodesServiceFactory from '../controllers/reference-codes-service'
import coursesQualifications from '../controllers/prisonerProfile/prisonerCoursesQualificationsDetails'
import learnerEmployabilitySkills from '../controllers/prisonerProfile/learnerEmployabilitySkillsDetails'
import workInsidePrison from '../controllers/prisonerProfile/prisonerWorkInsidePrisonDetails'
import unacceptableAbsencesDetails from '../controllers/prisonerProfile/unacceptableAbsencesDetails'
import prisonerProfileRedirect from '../controllers/prisonerProfile/prisonerProfileRedirect'

const router = express.Router({ mergeParams: true })

const controller = ({
  prisonApi,
  prisonerAlertsApi,
  keyworkerApi,
  oauthApi,
  hmppsManageUsersApi,
  caseNotesApi,
  allocationManagerApi,
  systemOauthClient,
  dataComplianceApi,
  pathfinderApi,
  logError,
  socApi,
  whereaboutsApi,
  complexityApi,
  offenderSearchApi,
  curiousApi,
  incentivesApi,
  restrictedPatientApi,
  nonAssociationsApi,
}) => {
  const prisonerProfileService = prisonerProfileServiceFactory({
    prisonApi,
    keyworkerApi,
    oauthApi,
    hmppsManageUsersApi,
    dataComplianceApi,
    pathfinderApi,
    systemOauthClient,
    socApi,
    allocationManagerApi,
    complexityApi,
    incentivesApi,
    curiousApi,
    offenderSearchApi,
  })
  const personService = personServiceFactory(prisonApi)
  const prisonerFinanceService = prisonerFinanceServiceFactory(prisonApi)
  const referenceCodesService = referenceCodesServiceFactory(prisonerAlertsApi)
  const esweService = EsweService.create(curiousApi, systemOauthClient, prisonApi, whereaboutsApi)

  router.get(
    '/',
    prisonerProfileRedirect({
      path: '/',
      handler: prisonerQuickLook({
        prisonerProfileService,
        prisonApi,
        oauthApi,
        telemetry,
        systemOauthClient,
        incentivesApi,
        restrictedPatientApi,
        nonAssociationsApi,
      }),
    })
  )

  router.get('/image', prisonerProfileRedirect({ path: '/image', handler: prisonerFullImage({ prisonApi }) }))

  router.get(
    '/personal',
    prisonerProfileRedirect({
      path: '/personal',
      handler: prisonerPersonal({
        prisonerProfileService,
        personService,
        prisonApi,
        allocationManagerApi,
        esweService,
        systemOauthClient,
        oauthApi,
        restrictedPatientApi,
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonerProfileService: { getP... Remove this comment to see the full error message
        logError,
      }),
    })
  )
  router.get(
    '/alerts',
    prisonerProfileRedirect({
      path: '/alerts',
      handler: prisonerAlerts({
        prisonerProfileService,
        referenceCodesService,
        paginationService,
        prisonerAlertsApi,
        oauthApi,
        systemOauthClient,
        restrictedPatientApi,
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonerProfileService: { getP... Remove this comment to see the full error message
        logError,
      }),
    })
  )
  router.get(
    '/case-notes',
    prisonerProfileRedirect({
      path: '/case-notes',
      handler: prisonerCaseNotes({
        caseNotesApi,
        prisonerProfileService,
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ caseNotesApi: any; prisonerPro... Remove this comment to see the full error message
        prisonApi,
        paginationService,
        nunjucks,
        logError,
        oauthApi,
        systemOauthClient,
        restrictedPatientApi,
      }),
    })
  )
  router.get(
    '/sentence-and-release',
    prisonerProfileRedirect({
      path: '/offences',
      handler: prisonerSentenceAndRelease({
        prisonerProfileService,
        prisonApi,
        systemOauthClient,
        oauthApi,
        restrictedPatientApi,
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonerProfileService: { getP... Remove this comment to see the full error message
        logError,
      }),
    })
  )
  router.get(
    '/work-and-skills',
    prisonerProfileRedirect({
      path: '/work-and-skills',
      handler: prisonerWorkAndSkills({ prisonerProfileService, esweService }),
    })
  )
  router.get('/unacceptable-absences', unacceptableAbsencesDetails({ paginationService, prisonApi, esweService }))
  router.get('/courses-qualifications', coursesQualifications({ paginationService, prisonApi, esweService }))
  router.get('/skills', learnerEmployabilitySkills({ paginationService, prisonApi, esweService }))
  router.get('/work-activities', workInsidePrison({ paginationService, prisonApi, esweService }))
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: any; logError: any;... Remove this comment to see the full error message
  router.get('/visits-details', prisonerVisits({ prisonApi, logError }))
  router.get('/schedule', prisonerSchedule({ prisonApi, logError }))
  router.get(
    '/professional-contacts',
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: any; personService:... Remove this comment to see the full error message
    prisonerProfessionalContacts({ prisonApi, personService, allocationManagerApi, systemOauthClient, logError })
  )

  router.get(
    '/cell-history',
    prisonerProfileRedirect({
      path: '/location-details',
      handler: prisonerCellHistory({ oauthApi, systemOauthClient, prisonApi }),
    })
  )

  router.get(
    '/location-history',
    prisonerLocationHistory({ prisonApi, whereaboutsApi, caseNotesApi, systemOauthClient })
  )
  router.get('/prisoner-finance-details/damage-obligations', prisonerDamageObligations({ prisonApi }))
  router.get('/prisoner-finance-details/private-cash', prisonerPrivateCash({ prisonApi, prisonerFinanceService }))
  router.get('/prisoner-finance-details/spends', prisonerSpends({ prisonApi, prisonerFinanceService }))
  router.get('/prisoner-finance-details/savings', prisonerSavings({ prisonApi, prisonerFinanceService }))

  router.get('/csra-history', prisonerCsraHistory({ prisonApi }))
  router.get('/csra-review', prisonerCsraReview({ prisonApi }))

  return router
}

export default (dependencies) => controller(dependencies)
