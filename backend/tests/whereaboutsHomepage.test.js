const whereaboutsHomepageController = require('../controllers/whereabouts/whereaboutsHomepage')

describe('Homepage', () => {
  const oauthApi = {}

  let req
  let res
  let controller

  beforeEach(() => {
    req = {}
    res = { locals: {}, render: jest.fn(), redirect: jest.fn() }

    oauthApi.userRoles = jest.fn().mockResolvedValue([])

    controller = whereaboutsHomepageController(oauthApi)
  })

  it('should make the required calls to endpoints', async () => {
    await controller(req, res)

    expect(oauthApi.userRoles).toHaveBeenCalledWith({})
  })

  describe('Tasks', () => {
    it('should render template with correct non role specfic tasks', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('whereabouts/whereaboutsHomepage.njk', {
        tasks: [
          {
            description: 'View all activities for people living in a residential location.',
            heading: 'View by residential location',
            href: '/manage-prisoner-whereabouts/select-residential-location',
            id: 'view-residential-location',
          },
          {
            description: 'View all activities in an activity or appointment location.',
            heading: 'View by activity or appointment location',
            href: '/manage-prisoner-whereabouts/select-location',
            id: 'view-activity-location',
          },
          {
            description: 'View all appointments in your establishment.',
            heading: 'View all appointments',
            href: '/appointments',
            id: 'view-all-appointments',
          },
          {
            description: 'View all prisoners not marked as attended or not attended.',
            heading: 'View prisoners unaccounted for',
            href: '/manage-prisoner-whereabouts/prisoners-unaccounted-for',
            id: 'view-unaccounted-for',
          },
          {
            description: 'View a breakdown of attendance statistics.',
            heading: 'View attendance reason statistics',
            href: '/manage-prisoner-whereabouts/attendance-reason-statistics',
            id: 'view-attendance-statistics',
          },
        ],
      })
    })
  })
})
