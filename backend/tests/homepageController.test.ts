import config from '../config'
import homepageController from '../controllers/homepage/homepage'

describe('Homepage', () => {
  const oauthApi = {}
  const prisonApi = {}
  const whereaboutsApi = {}
  const keyworkerApi = {}

  let req
  let res
  let logError
  let controller

  beforeEach(() => {
    config.apis.useOfForce.ui_url = undefined
    config.apis.useOfForce.prisons = undefined
    config.apis.omic.url = undefined

    req = {
      session: {
        userDetails: {
          staffId: 1,
          activeCaseLoadId: 'MDI',
        },
      },
    }
    res = { locals: {}, render: jest.fn(), redirect: jest.fn() }

    logError = jest.fn()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userLocations' does not exist on type '{... Remove this comment to see the full error message
    prisonApi.userLocations = jest.fn().mockResolvedValue([])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getStaffRoles' does not exist on type '{... Remove this comment to see the full error message
    prisonApi.getStaffRoles = jest.fn().mockResolvedValue([])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
    oauthApi.userRoles = jest.fn().mockResolvedValue([])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getWhereaboutsConfig' does not exist on ... Remove this comment to see the full error message
    whereaboutsApi.getWhereaboutsConfig = jest.fn().mockResolvedValue({})
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonMigrationStatus' does not exist... Remove this comment to see the full error message
    keyworkerApi.getPrisonMigrationStatus = jest.fn().mockResolvedValue({ migrated: true })

    controller = homepageController({ oauthApi, prisonApi, whereaboutsApi, keyworkerApi, logError })
  })

  it('should make the required calls to endpoints', async () => {
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userLocations' does not exist on type '{... Remove this comment to see the full error message
    expect(prisonApi.userLocations).toHaveBeenCalledWith({})
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getStaffRoles' does not exist on type '{... Remove this comment to see the full error message
    expect(prisonApi.getStaffRoles).toHaveBeenCalledWith({}, 1, 'MDI')
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
    expect(oauthApi.userRoles).toHaveBeenCalledWith({})
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getWhereaboutsConfig' does not exist on ... Remove this comment to see the full error message
    expect(whereaboutsApi.getWhereaboutsConfig).toHaveBeenCalledWith({}, 'MDI')
  })

  describe('Search', () => {
    it('should render home page with the correct location options', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userLocations' does not exist on type '{... Remove this comment to see the full error message
      prisonApi.userLocations.mockResolvedValue([
        { description: 'Moorland (HMP & YOI)', locationPrefix: 'MDI' },
        { description: 'Houseblock 1', locationPrefix: 'MDI-1' },
      ])

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          locationOptions: [
            { text: 'Moorland (HMP & YOI)', value: 'MDI' },
            { text: 'Houseblock 1', value: 'MDI-1' },
          ],
        })
      )
    })
  })

  describe('Tasks', () => {
    it('should render home page with no tasks', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [],
        })
      )
    })

    it('should render home page with the the global search task', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
      oauthApi.userRoles.mockResolvedValue([{ roleCode: 'GLOBAL_SEARCH' }])

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [
            {
              id: 'global-search',
              heading: 'Global search',
              description: 'Search for someone in any establishment, or who has been released.',
              href: '/global-search',
            },
          ],
        })
      )
    })

    it('should render home page with the my key worker allocation task', async () => {
      config.apis.omic.url = 'http://omic-url'

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getStaffRoles' does not exist on type '{... Remove this comment to see the full error message
      prisonApi.getStaffRoles.mockResolvedValue([{ role: 'KW' }])

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [
            {
              id: 'key-worker-allocations',
              heading: 'My key worker allocation',
              href: 'http://omic-url/key-worker/1',
              description: 'View your key worker cases.',
            },
          ],
        })
      )
    })

    it('should render home page with the manage prisoner whereabouts task', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getWhereaboutsConfig' does not exist on ... Remove this comment to see the full error message
      whereaboutsApi.getWhereaboutsConfig.mockResolvedValue({ enabled: true })

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [
            {
              id: 'manage-prisoner-whereabouts',
              heading: 'Manage prisoner whereabouts',
              description:
                'View unlock lists, all appointments and COVID units, manage attendance and add bulk appointments.',
              href: '/manage-prisoner-whereabouts',
            },
          ],
        })
      )
    })

    it('should render page with the view change someones cell task', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
      oauthApi.userRoles.mockResolvedValue([{ roleCode: 'CELL_MOVE' }])

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [
            {
              id: 'change-someones-cell',
              heading: 'Change someone’s cell',
              description:
                'Complete a cell move and view the 7 day history of all cell moves completed in your establishment.',
              href: '/change-someones-cell',
            },
          ],
        })
      )
    })

    it('should render home page with the use of force task', async () => {
      config.apis.useOfForce.ui_url = 'http://use-of-force-url'
      config.apis.useOfForce.prisons = 'MDI'

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [
            {
              id: 'use-of-force',
              heading: 'Use of force incidents',
              description: 'Manage and view incident reports and statements.',
              href: 'http://use-of-force-url',
            },
          ],
        })
      )
    })

    it('should render home page with the pathfinder task', async () => {
      config.apis.pathfinder.ui_url = 'http://pathfinder-url'

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
      oauthApi.userRoles.mockResolvedValue([
        { roleCode: 'PF_STD_PRISON' },
        { roleCode: 'PF_STD_PROBATION' },
        { roleCode: 'PF_APPROVAL' },
        { roleCode: 'PF_STD_PRISON_RO' },
        { roleCode: 'PF_STD_PROBATION_RO' },
        { roleCode: 'PF_POLICE' },
        { roleCode: 'PF_HQ' },
        { roleCode: 'PF_PSYCHOLOGIST' },
        { roleCode: 'PF_NATIONAL_READER' },
        { roleCode: 'PF_LOCAL_READER' },
      ])

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [
            {
              id: 'pathfinder',
              heading: 'Pathfinder',
              description: 'Manage your Pathfinder caseloads.',
              href: 'http://pathfinder-url',
            },
          ],
        })
      )
    })

    it('should render home page with the hdc licences task', async () => {
      config.applications.licences.url = 'http://licences-url'

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
      oauthApi.userRoles.mockResolvedValue([
        { roleCode: 'NOMIS_BATCHLOAD' },
        { roleCode: 'LICENCE_CA' },
        { roleCode: 'LICENCE_DM' },
        { roleCode: 'LICENCE_RO' },
        { roleCode: 'LICENCE_VARY' },
        { roleCode: 'LICENCE_READONLY' },
      ])

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [
            {
              id: 'hdc-licences',
              heading: 'HDC and licences',
              description: 'Create and manage Home Detention Curfew and licences.',
              href: 'http://licences-url',
            },
          ],
        })
      )
    })

    it('should render home page with the establishment roll task', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userLocations' does not exist on type '{... Remove this comment to see the full error message
      prisonApi.userLocations.mockResolvedValue([
        { description: 'Moorland (HMP & YOI)', locationPrefix: 'MDI' },
        { description: 'Houseblock 1', locationPrefix: 'MDI-1' },
      ])

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [
            {
              id: 'establishment-roll',
              heading: 'Establishment roll check',
              description: 'View the roll broken down by residential unit and see who is arriving and leaving.',
              href: '/establishment-roll',
            },
          ],
        })
      )
    })

    it('should render home page with the manage key workers task', async () => {
      config.apis.omic.url = 'http://omic-url'

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
      oauthApi.userRoles.mockResolvedValue([{ roleCode: 'OMIC_ADMIN' }, { roleCode: 'KEYWORKER_MONITOR' }])

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [
            {
              id: 'manage-key-workers',
              heading: 'Manage key workers',
              description: 'Add and remove key workers from prisoners and manage individuals.',
              href: 'http://omic-url',
            },
          ],
        })
      )
    })

    describe('when a prison has not been migrated for manage key workers', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonMigrationStatus' does not exist... Remove this comment to see the full error message
        keyworkerApi.getPrisonMigrationStatus = jest.fn().mockResolvedValue({ migrated: false })
      })
      it('should not show the manage key workers link', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
        oauthApi.userRoles.mockResolvedValue([{ roleCode: 'OMIC_ADMIN' }])
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'homepage/homepage.njk',
          expect.objectContaining({
            tasks: [],
          })
        )
      })

      it('should show the manage key worker link if the user has the migrate role', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
        oauthApi.userRoles.mockResolvedValue([{ roleCode: 'KW_MIGRATION' }])
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'homepage/homepage.njk',
          expect.objectContaining({
            tasks: [
              {
                description: 'Add and remove key workers from prisoners and manage individuals.',
                heading: 'Manage key workers',
                href: undefined,
                id: 'manage-key-workers',
              },
            ],
          })
        )
      })
    })

    it('should render home page with the manage users task', async () => {
      config.applications.manageaccounts.url = 'http://manage-auth-accounts-url'

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
      oauthApi.userRoles.mockResolvedValue([
        { roleCode: 'MAINTAIN_ACCESS_ROLES' },
        { roleCode: 'MAINTAIN_ACCESS_ROLES_ADMIN' },
        { roleCode: 'MAINTAIN_OAUTH_USERS' },
        { roleCode: 'AUTH_GROUP_MANAGER' },
      ])

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [
            {
              id: 'manage-users',
              heading: 'Manage user accounts',
              description:
                'As a Local System Administrator (LSA) or administrator, manage accounts and groups for service users.',
              href: 'http://manage-auth-accounts-url',
            },
          ],
        })
      )
    })

    it('should render home page with the categorisation task', async () => {
      config.apis.categorisation.ui_url = 'http://categorisation-url'

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
      oauthApi.userRoles.mockResolvedValue([
        { roleCode: 'CREATE_CATEGORISATION' },
        { roleCode: 'CREATE_RECATEGORISATION' },
        { roleCode: 'APPROVE_CATEGORISATION' },
        { roleCode: 'CATEGORISATION_SECURITY' },
      ])

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [
            {
              id: 'categorisation',
              heading: 'Categorisation',
              description:
                'View a prisoner’s category and complete either a first time categorisation or a recategorisation.',
              href: 'http://categorisation-url',
            },
          ],
        })
      )
    })

    it('should render home page with the book a secure move task', async () => {
      config.applications.pecs.url = 'http://pecs-url'

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
      oauthApi.userRoles.mockResolvedValue([{ roleCode: 'PECS_OCA' }, { roleCode: 'PECS_PRISON' }])

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [
            {
              id: 'secure-move',
              heading: 'Book a secure move',
              description:
                'Schedule secure movement for prisoners in custody, via approved transport suppliers, between locations across England and Wales.',
              href: 'http://pecs-url',
            },
          ],
        })
      )
    })

    it('should render home page with the prison offender managers task', async () => {
      config.applications.moic.url = 'http://moic-url'

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
      oauthApi.userRoles.mockResolvedValue([{ roleCode: 'ALLOC_MGR' }, { roleCode: 'ALLOC_CASE_MGR' }])

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [
            {
              id: 'pom',
              heading: 'Manage Prison Offender Managers’ cases',
              description: 'Allocate a Prison Offender Manager (POM) to a prisoner and manage their cases.',
              href: 'http://moic-url',
            },
          ],
        })
      )
    })

    it('should render home page with the serious organised crime task', async () => {
      config.apis.soc.ui_url = 'http://soc-url'

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
      oauthApi.userRoles.mockResolvedValue([{ roleCode: 'SOC_CUSTODY' }, { roleCode: 'SOC_COMMUNITY' }])

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [
            {
              id: 'soc',
              heading: 'Manage SOC cases',
              description: 'Manage your Serious and Organised Crime (SOC) caseload.',
              href: 'http://soc-url',
            },
          ],
        })
      )
    })

    it('should render home page with the serious organised crime task when the user has the SOC_HQ role', async () => {
      config.apis.soc.ui_url = 'http://soc-url'

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
      oauthApi.userRoles.mockResolvedValue([{ roleCode: 'SOC_HQ' }])

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [
            {
              id: 'soc',
              heading: 'Manage SOC cases',
              description: 'Manage your Serious and Organised Crime (SOC) caseload.',
              href: 'http://soc-url',
            },
          ],
        })
      )
    })

    it('should redirect to video link booking for court users', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
      oauthApi.userRoles.mockResolvedValue([{ roleCode: 'VIDEO_LINK_COURT_USER' }])

      await controller(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/videolink')
    })
  })
})
