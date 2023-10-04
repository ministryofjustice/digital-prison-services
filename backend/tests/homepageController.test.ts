/* eslint-disable @typescript-eslint/no-explicit-any */
import config from '../config'
import homepageController from '../controllers/homepage/homepage'

describe('Homepage', () => {
  const oauthApi: any = {}
  const prisonApi: any = {}
  const whereaboutsApi: any = {}
  const keyworkerApi: any = {}

  let req
  let res
  let logError
  let controller

  beforeEach(() => {
    config.apis.useOfForce.ui_url = undefined
    config.apis.useOfForce.prisons = undefined
    config.apis.omic.url = undefined
    config.apis.manageAdjudications.enabled_prisons = undefined
    config.apis.manageAdjudications.ui_url = undefined
    config.apis.manageRestrictedPatients.ui_url = undefined
    config.apis.managePrisonVisits.ui_url = undefined
    config.apis.legacyPrisonVisits.ui_url = undefined
    config.apis.secureSocialVideoCalls.ui_url = undefined
    config.applications.sendLegalMail.url = undefined
    config.apis.welcomePeopleIntoPrison.enabled_prisons = undefined
    config.apis.welcomePeopleIntoPrison.url = undefined
    config.apis.mercurySubmit.url = undefined
    config.apis.mercurySubmit.enabled_prisons = undefined
    config.apis.mercurySubmit.privateBetaDate = undefined
    config.apis.mercurySubmit.liveDate = undefined
    config.apis.incentives.ui_url = undefined
    config.app.whereaboutsMaintenanceMode = false
    config.app.keyworkerMaintenanceMode = false

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

    prisonApi.userLocations = jest.fn().mockResolvedValue([])
    prisonApi.getStaffRoles = jest.fn().mockResolvedValue([])
    oauthApi.userRoles = jest.fn().mockReturnValue([])
    whereaboutsApi.getWhereaboutsConfig = jest.fn().mockResolvedValue({})
    keyworkerApi.getPrisonMigrationStatus = jest.fn().mockResolvedValue({ migrated: true })

    controller = homepageController({ oauthApi, prisonApi, whereaboutsApi, keyworkerApi, logError })
  })

  it('should make the required calls to endpoints', async () => {
    await controller(req, res)

    expect(prisonApi.userLocations).toHaveBeenCalledWith({})
    expect(prisonApi.getStaffRoles).toHaveBeenCalledWith({}, 1, 'MDI')
    expect(oauthApi.userRoles).toHaveBeenCalledWith({})
    expect(whereaboutsApi.getWhereaboutsConfig).toHaveBeenCalledWith({}, 'MDI')
  })

  describe('Search', () => {
    it('should render home page with the correct location options', async () => {
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
      oauthApi.userRoles.mockReturnValue([{ roleCode: 'GLOBAL_SEARCH' }])

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

    it('should render home page with the prisoner whereabouts task', async () => {
      whereaboutsApi.getWhereaboutsConfig.mockResolvedValue({ enabled: true })

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [
            {
              id: 'manage-prisoner-whereabouts',
              heading: 'Prisoner whereabouts',
              description:
                'View unlock lists, all appointments and COVID units, manage attendance and add bulk appointments.',
              href: '/manage-prisoner-whereabouts',
            },
          ],
        })
      )
    })

    it('should render page with the view change someones cell task', async () => {
      oauthApi.userRoles.mockReturnValue([{ roleCode: 'CELL_MOVE' }])

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

    it('should render home page with the manage adjudications task', async () => {
      config.apis.manageAdjudications.ui_url = 'http://manage-adjudications-url'
      config.apis.manageAdjudications.enabled_prisons = 'MDI'

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [
            expect.objectContaining({
              id: 'manage-adjudications',
              href: 'http://manage-adjudications-url',
            }),
          ],
        })
      )
    })

    it('should render home page with the manage prison visits task', async () => {
      oauthApi.userRoles.mockReturnValue([{ roleCode: 'MANAGE_PRISON_VISITS' }])
      config.apis.managePrisonVisits.ui_url = 'http://book-a-prison-visit-url'

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [
            expect.objectContaining({
              id: 'book-a-prison-visit',
              href: 'http://book-a-prison-visit-url',
              heading: 'Manage prison visits',
              description: 'Book, view and cancel a prisoner’s social visits.',
            }),
          ],
        })
      )
    })

    it('should render home page with the legacy book a prison visit task', async () => {
      oauthApi.userRoles.mockReturnValue([{ roleCode: 'PVB_REQUESTS' }])
      config.apis.legacyPrisonVisits.ui_url = 'http://legacy-prison-visit-url'

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [
            expect.objectContaining({
              id: 'legacy-prison-visit',
              href: 'http://legacy-prison-visit-url',
              heading: 'Online visit requests',
              description: 'Respond to online social visit requests.',
            }),
          ],
        })
      )
    })

    it('should render home page with the secure social prison visits tile', async () => {
      oauthApi.userRoles.mockReturnValue([{ roleCode: 'SOCIAL_VIDEO_CALLS' }])
      config.apis.secureSocialVideoCalls.ui_url = 'http://secure-social-video-calls-url'

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [
            expect.objectContaining({
              id: 'secure-social-video-calls',
              href: 'http://secure-social-video-calls-url',
              heading: 'Secure social video calls',
              description:
                'Manage and monitor secure social video calls with prisoners. Opens the Prison Video Calls application.',
            }),
          ],
        })
      )
    })

    test.each`
      role
      ${'PF_USER'}
      ${'PF_ADMIN'}
      ${'PF_STD_PRISON'}
      ${'PF_STD_PROBATION'}
      ${'PF_APPROVAL'}
      ${'PF_STD_PRISON_RO'}
      ${'PF_STD_PROBATION_RO'}
      ${'PF_POLICE'}
      ${'PF_HQ'}
      ${'PF_PSYCHOLOGIST'}
      ${'PF_NATIONAL_READER'}
      ${'PF_LOCAL_READER'}
    `('Should render homepage with the Pathfinder task for role: $role', async ({ role }) => {
      config.apis.pathfinder.ui_url = 'http://pathfinder-url'

      oauthApi.userRoles.mockReturnValue([{ roleCode: role }])

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

    test.each`
      role
      ${'PVB_REQUESTS'}
      ${'NOT_A_PF_ROLE'}
      ${'SOC_CUSTODY'}
    `('Should not render homepage with the Pathfinder task for role: $role', async ({ role }) => {
      config.apis.pathfinder.ui_url = 'http://pathfinder-url'

      oauthApi.userRoles.mockReturnValue([{ roleCode: role }])

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.not.objectContaining({
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

      oauthApi.userRoles.mockReturnValue([
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
              heading: 'Home Detention Curfew',
              description: 'Create and manage Home Detention Curfew.',
              href: 'http://licences-url',
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

      oauthApi.userRoles.mockReturnValue([{ roleCode: 'OMIC_ADMIN' }, { roleCode: 'KEYWORKER_MONITOR' }])

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [
            {
              id: 'manage-key-workers',
              heading: 'Key workers',
              description: 'Add and remove key workers from prisoners and manage individuals.',
              href: 'http://omic-url',
            },
          ],
        })
      )
    })

    describe('when a prison has not been migrated for manage key workers', () => {
      beforeEach(() => {
        keyworkerApi.getPrisonMigrationStatus = jest.fn().mockResolvedValue({ migrated: false })
      })

      it('should not show the manage key workers link', async () => {
        oauthApi.userRoles.mockReturnValue([{ roleCode: 'OMIC_ADMIN' }])
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'homepage/homepage.njk',
          expect.objectContaining({
            tasks: [],
          })
        )
      })

      it('should show the manage key worker link if the user has the migrate role', async () => {
        oauthApi.userRoles.mockReturnValue([{ roleCode: 'KW_MIGRATION' }])
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'homepage/homepage.njk',
          expect.objectContaining({
            tasks: [
              {
                description: 'Add and remove key workers from prisoners and manage individuals.',
                heading: 'Key workers',
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

      oauthApi.userRoles.mockReturnValue([
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

      oauthApi.userRoles.mockReturnValue([
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

      oauthApi.userRoles.mockReturnValue([{ roleCode: 'PECS_OCA' }, { roleCode: 'PECS_PRISON' }])

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

      oauthApi.userRoles.mockReturnValue([{ roleCode: 'ALLOC_MGR' }, { roleCode: 'ALLOC_CASE_MGR' }])

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [
            {
              id: 'pom',
              heading: 'View POM cases',
              description: 'Keep track of your allocations. If you allocate cases, you also can do that here.',
              href: 'http://moic-url',
            },
          ],
        })
      )
    })

    it('should render home page with the serious organised crime task', async () => {
      config.apis.soc.ui_url = 'http://soc-url'

      oauthApi.userRoles.mockReturnValue([{ roleCode: 'SOC_CUSTODY' }, { roleCode: 'SOC_COMMUNITY' }])

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

      oauthApi.userRoles.mockReturnValue([{ roleCode: 'SOC_HQ' }])

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
      oauthApi.userRoles.mockReturnValue([{ roleCode: 'VIDEO_LINK_COURT_USER' }])

      await controller(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/videolink')
    })

    describe('Incentives', () => {
      beforeEach(() => {
        config.apis.incentives.ui_url = 'http://incentives'
        prisonApi.userLocations.mockResolvedValue([
          { description: 'Moorland (HMP & YOI)', locationPrefix: 'MDI' },
          { description: 'Houseblock 1', locationPrefix: 'MDI-1' },
        ])
      })

      const expectIncentivesTaskToNotBeVisible = async () => {
        await controller(req, res)
        expect(res.render).toHaveBeenCalledWith(
          'homepage/homepage.njk',
          expect.objectContaining({
            tasks: expect.not.arrayContaining([
              {
                id: 'incentives',
                heading: 'Incentives',
                href: 'http://incentives',
                description: expect.any(String),
              },
            ]),
          })
        )
      }

      const expectIncentivesTaskToBeVisible = async () => {
        await controller(req, res)
        expect(res.render).toHaveBeenCalledWith(
          'homepage/homepage.njk',
          expect.objectContaining({
            tasks: expect.arrayContaining([
              {
                id: 'incentives',
                heading: 'Incentives',
                href: 'http://incentives',
                description: expect.any(String),
              },
            ]),
          })
        )
      }

      it('should not render home page with the Incentives tile if user has no locations nor central admin role', async () => {
        prisonApi.userLocations.mockResolvedValue([])

        return expectIncentivesTaskToNotBeVisible()
      })

      it('should not render home page with the Incentives tile if incentives URL not provided', async () => {
        config.apis.incentives.ui_url = undefined

        return expectIncentivesTaskToNotBeVisible()
      })

      it('should render home page with the Incentives tile if user has at least one location', async () => {
        return expectIncentivesTaskToBeVisible()
      })

      it('should render home page with the Incentives tile if user has no locations but does have central admin role', async () => {
        prisonApi.userLocations.mockResolvedValue([])
        oauthApi.userRoles.mockReturnValue([{ roleCode: 'MAINTAIN_INCENTIVE_LEVELS' }])

        return expectIncentivesTaskToBeVisible()
      })
    })

    describe('Manage education profile service tile', () => {
      it('Should not display the Get someone ready to work tile when required roles are missing', async () => {
        oauthApi.userRoles.mockReturnValue([{ roleCode: 'NO_ROLE' }])

        await controller(req, res)
        expect(res.render).toHaveBeenCalledWith(
          'homepage/homepage.njk',
          expect.objectContaining({
            tasks: [],
          })
        )
      })

      it('Should render home page with the Get someone ready to work tile when required roles are present', async () => {
        config.apis.getSomeoneReadyForWork.ui_url = '/'

        oauthApi.userRoles.mockReturnValue([{ roleCode: 'WORK_READINESS_VIEW' }])

        await controller(req, res)
        expect(res.render).toHaveBeenCalledWith(
          'homepage/homepage.njk',
          expect.objectContaining({
            tasks: [
              {
                id: 'get-someone-ready-to-work',
                heading: 'Get someone ready to work',
                description:
                  'Record what support a prisoner needs to get work. View who has been assessed as ready to work.',
                href: '/?sort=releaseDate&order=descending',
              },
            ],
          })
        )
      })
    })

    it('Should render home page with the CIAG tile when required roles are present', async () => {
      config.apis.learningAndWorkProgress.ui_url = '/'

      oauthApi.userRoles.mockReturnValue([{ roleCode: 'EDUCATION_WORK_PLAN_EDITOR' }])

      await controller(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [
            {
              id: 'learning-and-work-progress',
              heading: 'Learning and work progress',
              description: 'View and manage learning and work history, support needs, goals and progress.',
              href: '/',
            },
          ],
        })
      )
    })

    it('should render home page with the send legal mail task', () => {
      config.applications.sendLegalMail.url = 'http://check-rule39-mail'

      Array.of('SLM_SCAN_BARCODE', 'SLM_ADMIN').forEach(async (roleCode) => {
        oauthApi.userRoles.mockReturnValue([{ roleCode }])

        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'homepage/homepage.njk',
          expect.objectContaining({
            tasks: [
              {
                id: 'check-rule39-mail',
                heading: 'Check Rule 39 mail',
                description: 'Scan barcodes on mail from law firms and other approved senders.',
                href: 'http://check-rule39-mail',
              },
            ],
          })
        )
      })
    })

    it('should not display the Welcome people into prison task on the home page', async () => {
      config.apis.welcomePeopleIntoPrison.url = 'https://welcome.prison.service.justice.gov.uk'
      config.apis.welcomePeopleIntoPrison.enabled_prisons = 'LEI,NMI'

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [],
        })
      )
    })

    it('should display the Welcome people into prison task on the home page', async () => {
      config.apis.welcomePeopleIntoPrison.url = 'https://wpipUrl.prison.service.justice.gov.uk'
      config.apis.welcomePeopleIntoPrison.enabled_prisons = 'LEI,NMI,MDI'

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [
            {
              description:
                'View prisoners booked to arrive today, add them to the establishment roll, and manage reception tasks for recent arrivals.',
              heading: 'Welcome people into prison',
              href: 'https://wpipUrl.prison.service.justice.gov.uk',
              id: 'welcome-people-into-prison',
            },
          ],
        })
      )
    })

    it('should not display the Mercury Submit Private Beta task on the home page', async () => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2023-07-03').getTime())

      config.apis.mercurySubmit.url = 'https://welcome.prison.service.justice.gov.uk'
      config.apis.mercurySubmit.enabled_prisons = 'LEI,NMI'
      config.apis.mercurySubmit.privateBetaDate = new Date('2023-07-04').getTime()
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [],
        })
      )
      jest.useRealTimers()
    })

    it('should display the Mercury Submit Private Beta task on the home page', async () => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2023-07-03').getTime())
      config.apis.mercurySubmit.url = 'https://welcome.prison.service.justice.gov.uk'
      config.apis.mercurySubmit.enabled_prisons = 'LEI,NMI,MDI'
      config.apis.mercurySubmit.privateBetaDate = new Date('2023-07-01').getTime()

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [
            {
              description:
                'Access to the new Mercury submission form for those establishments enrolled in the private beta',
              heading: 'Submit an Intelligence Report (Private Beta)',
              href: 'https://welcome.prison.service.justice.gov.uk',
              id: 'submit-an-intelligence-report-private-beta',
            },
          ],
        })
      )
      jest.useRealTimers()
    })

    it('should display the Mercury Submit task on the home page', async () => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2023-07-03').getTime())
      config.apis.mercurySubmit.url = 'https://welcome.prison.service.justice.gov.uk'
      config.apis.mercurySubmit.liveDate = new Date('2023-07-01').getTime()

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [
            {
              description: 'Access to the new Mercury submission form',
              heading: 'Submit an Intelligence Report',
              href: 'https://welcome.prison.service.justice.gov.uk',
              id: 'submit-an-intelligence-report',
            },
          ],
        })
      )
      jest.useRealTimers()
    })

    it('should not display the Manage Restricted Patients task on the homepage if none of the correct roles are present', async () => {
      config.apis.manageRestrictedPatients.ui_url = 'http://manage-restricted-patients-url'
      oauthApi.userRoles.mockReturnValue([])
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [],
        })
      )
    })

    it('should display the Manage Restricted Patients task on the homepage if any of the correct roles are present', async () => {
      config.apis.manageRestrictedPatients.ui_url = 'http://manage-restricted-patients-url'
      oauthApi.userRoles.mockReturnValue([
        { roleCode: 'SEARCH_RESTRICTED_PATIENT' },
        { roleCode: 'TRANSFER_RESTRICTED_PATIENT' },
      ])

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [
            expect.objectContaining({
              id: 'manage-restricted-patients',
              href: 'http://manage-restricted-patients-url',
            }),
          ],
        })
      )
    })

    it('should display the Manage Restricted Patients task on the homepage if the migration role is present', async () => {
      config.apis.manageRestrictedPatients.ui_url = 'http://manage-restricted-patients-url'
      oauthApi.userRoles.mockReturnValue([{ roleCode: 'RESTRICTED_PATIENT_MIGRATION' }])

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [
            expect.objectContaining({
              id: 'manage-restricted-patients',
              href: 'http://manage-restricted-patients-url',
            }),
          ],
        })
      )
    })
  })

  describe('Tasks behind feature flags', () => {
    beforeEach(() => {
      config.app.whereaboutsMaintenanceMode = true
      config.app.keyworkerMaintenanceMode = true
    })

    it('should not display prisoner whereabouts task if flag is true', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [],
        })
      )
    })

    it('should not display key workers task if flag is true', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [],
        })
      )
    })

    it('Should render home page with the Prepare someone for release tile when required roles are present', async () => {
      config.apis.prepareSomeoneForRelease.ui_url = '/'

      oauthApi.userRoles.mockReturnValue([{ roleCode: 'RESETTLEMENT_PASSPORT_EDIT' }])

      await controller(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'homepage/homepage.njk',
        expect.objectContaining({
          tasks: [
            {
              id: 'prepare-someone-for-release',
              heading: 'Prepare someone for release',
              description: 'Search for people with resettlement needs. View and manage their information and support.',
              href: '/',
            },
          ],
        })
      )
    })
  })
})
