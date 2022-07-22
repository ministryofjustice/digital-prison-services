import permitController from '../controllers/permit'

describe('Permit', () => {
  const oauthApi = {}

  let req
  let res
  let next
  let controller

  beforeEach(() => {
    req = {}
    res = { locals: {} }
    next = jest.fn()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
    oauthApi.userRoles = jest.fn().mockReturnValue([])

    controller = permitController(oauthApi, ['CELL_MOVE'])
  })

  describe('without role', () => {
    it('should make the required calls to oauthApi userRoles but throw error', async () => {
      await expect(controller(req, res, next)).rejects.toEqual({
        response: { status: 403 },
        error: new Error('User does not have the correct roles for this page'),
      })
      expect(next).not.toHaveBeenCalled()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
      expect(oauthApi.userRoles).toHaveBeenCalledWith(res.locals)
    })
  })

  describe('with role', () => {
    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
      oauthApi.userRoles.mockReturnValue([{ roleCode: 'CELL_MOVE' }])
    })

    it('should call next to continue to the next controller', async () => {
      await controller(req, res, next)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
      expect(oauthApi.userRoles).toHaveBeenCalledWith(res.locals)
      expect(next).toHaveBeenCalled()
    })
  })
})
