const cellMoveHomepageController = require('../controllers/cellMove/cellMoveHomepage')

describe('Homepage', () => {
  const oauthApi = {}

  let req
  let res
  let controller

  beforeEach(() => {
    req = {}
    res = {
      locals: { user: { activeCaseLoad: { description: 'Moorland (HMP)' } } },
      render: jest.fn(),
      redirect: jest.fn(),
    }

    oauthApi.userRoles = jest.fn().mockResolvedValue([])

    controller = cellMoveHomepageController(oauthApi)
  })

  it('should make the required calls to endpoints', async () => {
    await controller(req, res)

    expect(oauthApi.userRoles).toHaveBeenCalledWith(res.locals)
  })

  it('should render not found template if no appropiate roles', async () => {
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith('notFound', { url: '/' })
  })

  describe('Tasks', () => {
    beforeEach(() => {
      oauthApi.userRoles.mockResolvedValue([{ roleCode: 'CELL_MOVE' }])
    })

    it('should render template with correct non role specfic tasks', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('cellMove/cellMoveHomepage', {
        tasks: [
          {
            id: 'search-for-prisoner',
            heading: 'Search for a prisoner',
            description: 'Change someone’s cell after searching for them using their name or prison number.',
            href: '/change-someones-cell/prisoner-search',
          },
          {
            id: 'view-residential-location',
            heading: 'View residential location',
            description:
              'View all prisoners in a residential location. You can view their cell history and change their cell.',
            href: '/change-someones-cell/view-residential-location',
          },
          {
            id: 'create-space',
            heading: 'Move someone temporarily out of a cell',
            description:
              'Create a space for another prisoner by moving someone out of a cell temporarily. You will need to allocate a cell to them later.',
            href: '/change-someones-cell/temporary-move',
          },
          {
            id: 'view-history',
            heading: 'View 7 day cell move history',
            description:
              'View all cell moves completed over the last 7 days in Moorland (HMP). Note that the name will be the caseload that the user has selected.',
            href: '/change-someones-cell/recent-cell-moves',
          },
          {
            id: 'no-cell-allocated',
            heading: 'No cell allocated',
            description:
              'View people who do not currently have a cell allocated having been temporarily moved out of a cell.',
            href: '/establishment-roll/no-cell-allocated',
          },
        ],
      })
    })
  })
})
