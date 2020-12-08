const config = require('../config')
const homeController = require('../controllers/homePage/homePage')

describe('Home page controller', () => {
  const oauthApi = {}
  const prisonApi = {}
  const whereaboutsApi = {}

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
    res = { locals: {}, render: jest.fn() }

    logError = jest.fn()

    prisonApi.userLocations = jest.fn().mockResolvedValue([])
    prisonApi.getStaffRoles = jest.fn().mockResolvedValue([])
    oauthApi.userRoles = jest.fn().mockResolvedValue([])
    whereaboutsApi.getWhereaboutsConfig = jest.fn().mockResolvedValue({})

    controller = homeController({ oauthApi, prisonApi, whereaboutsApi, logError })
  })

  it('should render home page with no tasks', async () => {
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'homePage/homePage.njk',
      expect.objectContaining({
        tasks: [],
      })
    )
  })

  it('should make a request for users roles', async () => {
    await controller(req, res)

    expect(oauthApi.userRoles).toHaveBeenCalledWith({})
  })

  it('should render home page with the the global search task', async () => {
    oauthApi.userRoles.mockResolvedValue([{ roleCode: 'GLOBAL_SEARCH' }])

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'homePage/homePage.njk',
      expect.objectContaining({
        tasks: [
          {
            id: 'global-search',
            text: 'Global search',
            subText: 'Search for someone in any establishment, or who has been released.',
            linkUrl: '/global-search',
          },
        ],
      })
    )
  })

  it('should render home page with the my key worker allocation task', async () => {
    config.apis.omic.url = 'http://omic-url'

    prisonApi.getStaffRoles.mockResolvedValue([{ role: 'KW' }])

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'homePage/homePage.njk',
      expect.objectContaining({
        tasks: [
          {
            id: 'key-worker-allocations',
            text: 'My key worker allocation',
            linkUrl: 'http://omic-url/key-worker/1',
            subText: 'View your key worker cases.',
          },
        ],
      })
    )
  })

  it('should render home page with the manage prisoner whereabouts task', async () => {
    whereaboutsApi.getWhereaboutsConfig.mockResolvedValue({ enabled: true })

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'homePage/homePage.njk',
      expect.objectContaining({
        tasks: [
          {
            id: 'manage-prisoner-whereabouts',
            text: 'Manage prisoner whereabouts',
            subText: 'View unlock lists and manage attendance.',
            linkUrl: '/manage-prisoner-whereabouts',
          },
        ],
      })
    )
  })

  it('should render home page with the view covid units task', async () => {
    oauthApi.userRoles.mockResolvedValue([{ roleCode: 'PRISON' }])

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'homePage/homePage.njk',
      expect.objectContaining({
        tasks: [
          {
            id: 'covid-units',
            text: 'View COVID units',
            subText: 'View who in your establishment is in each COVID unit.',
            linkUrl: '/current-covid-units',
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
      'homePage/homePage.njk',
      expect.objectContaining({
        tasks: [
          {
            id: 'use-of-force',
            text: 'Use of force incidents',
            subText: 'Manage and view incident reports and statements.',
            linkUrl: 'http://use-of-force-url',
          },
        ],
      })
    )
  })

  it('should render home page with the pathfinder task', async () => {
    config.apis.pathfinder.ui_url = 'http://pathfinder-url'

    oauthApi.userRoles.mockResolvedValue([{ roleCode: 'PF_STD_PRISON' }])

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'homePage/homePage.njk',
      expect.objectContaining({
        tasks: [
          {
            id: 'pathfinder',
            text: 'Pathfinder',
            subText: 'Manage your Pathfinder caseloads.',
            linkUrl: 'http://pathfinder-url',
          },
        ],
      })
    )
  })

  it('should render home page with the hdc licences task', async () => {
    config.applications.licences.url = 'http://licences-url'

    oauthApi.userRoles.mockResolvedValue([{ roleCode: 'LICENCE_RO' }])

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'homePage/homePage.njk',
      expect.objectContaining({
        tasks: [
          {
            id: 'hdc-licences',
            text: 'HDC and licences',
            subText: 'Create and manage Home Detention Curfew and licences.',
            linkUrl: 'http://licences-url',
          },
        ],
      })
    )
  })

  it('should render home page with the establishment roll task', async () => {
    prisonApi.userLocations.mockResolvedValue([
      { description: 'Moorland (HMP & YOI)', locationPrefix: 'MDI' },
      { description: 'Houseblock 1', locationPrefix: 'MDI-1' },
    ])

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'homePage/homePage.njk',
      expect.objectContaining({
        tasks: [
          {
            id: 'establishment-roll',
            text: 'Establishment roll check',
            subText: 'View the roll broken down by residential unit and see who is arriving and leaving.',
            linkUrl: '/establishment-roll',
          },
        ],
      })
    )
  })

  it('should render home page with the bulk appointments task', async () => {
    oauthApi.userRoles.mockResolvedValue([{ roleCode: 'BULK_APPOINTMENTS' }])

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'homePage/homePage.njk',
      expect.objectContaining({
        tasks: [
          {
            id: 'bulk-appointments',
            text: 'Add bulk appointments',
            subText: 'Upload a file to add appointments for multiple prisoners.',
            linkUrl: '/bulk-appointments/need-to-upload-file',
          },
        ],
      })
    )
  })

  it('should render home page with the manage key workers task', async () => {
    config.apis.omic.url = 'http://omic-url'

    oauthApi.userRoles.mockResolvedValue([{ roleCode: 'OMIC_ADMIN' }, { roleCode: 'KEYWORKER_MONITOR' }])

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'homePage/homePage.njk',
      expect.objectContaining({
        tasks: [
          {
            id: 'manage-key-workers',
            text: 'Key worker management service',
            subText: 'Add and remove key workers from prisoners and manage individuals.',
            linkUrl: 'http://omic-url',
          },
        ],
      })
    )
  })

  it('should render home page with the manage users task', async () => {
    config.applications.manageaccounts.url = 'http://manage-auth-accounts-url'

    oauthApi.userRoles.mockResolvedValue([
      { roleCode: 'MAINTAIN_ACCESS_ROLES' },
      { roleCode: 'MAINTAIN_ACCESS_ROLES_ADMIN' },
    ])

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'homePage/homePage.njk',
      expect.objectContaining({
        tasks: [
          {
            id: 'manage-users',
            text: 'Manage user accounts',
            subText:
              'As a Local System Administrator (LSA) or administrator, manage accounts and groups for service users.',
            linkUrl: 'http://manage-auth-accounts-url',
          },
        ],
      })
    )
  })

  it('should render home page with the categorisation task', async () => {
    config.apis.categorisation.ui_url = 'http://categorisation-url'

    oauthApi.userRoles.mockResolvedValue([{ roleCode: 'CREATE_CATEGORISATION' }])

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'homePage/homePage.njk',
      expect.objectContaining({
        tasks: [
          {
            id: 'categorisation',
            text: 'Categorisation',
            subText:
              'View a prisoner’s category and complete either an first time categorisation or a recategorisation.',
            linkUrl: 'http://categorisation-url',
          },
        ],
      })
    )
  })

  it('should render home page with the book a secure move task', async () => {
    config.applications.pecs.url = 'http://pecs-url'

    oauthApi.userRoles.mockResolvedValue([{ roleCode: 'PECS_OCA' }])

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'homePage/homePage.njk',
      expect.objectContaining({
        tasks: [
          {
            id: 'secure-move',
            text: 'Book a secure move',
            subText:
              'Schedule secure movement for prisoners in custody, via approved transport suppliers, between locations across England and Wales.',
            linkUrl: 'http://pecs-url',
          },
        ],
      })
    )
  })

  it('should render home page with the prison offender managers task', async () => {
    config.applications.moic.url = 'http://moic-url'

    oauthApi.userRoles.mockResolvedValue([{ roleCode: 'ALLOC_MGR' }])

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'homePage/homePage.njk',
      expect.objectContaining({
        tasks: [
          {
            id: 'pom',
            text: 'Manage Prison Offender Managers’ cases',
            subText: 'Allocate a Prison Offender Manager (POM) to a prisoner and manage their cases.',
            linkUrl: 'http://moic-url',
          },
        ],
      })
    )
  })

  it('should render home page with the serious organised crime task', async () => {
    config.apis.soc.url = 'http://soc-url'

    oauthApi.userRoles.mockResolvedValue([{ roleCode: 'SOC_CUSTODY' }])

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'homePage/homePage.njk',
      expect.objectContaining({
        tasks: [
          {
            id: 'soc',
            text: 'Manage SOC cases',
            subText: 'Manage your Serious and Organised Crime (SOC) caseload.',
            linkUrl: 'http://soc-url',
          },
        ],
      })
    )
  })
})
