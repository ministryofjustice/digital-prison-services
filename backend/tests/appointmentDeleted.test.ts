const appointmentDeleted = require('../controllers/appointmentDeleted')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'res'.
const res = { locals: {}, send: jest.fn(), redirect: jest.fn() }

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'controller... Remove this comment to see the full error message
let controller

beforeEach(() => {
  // @ts-expect-error ts-migrate(2588) FIXME: Cannot assign to 'controller' because it is a cons... Remove this comment to see the full error message
  controller = appointmentDeleted()

  // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
  res.render = jest.fn()
})

describe('appointment deleted', () => {
  describe('when one appointment is deleted', () => {
    const req = {
      query: {},
    }

    it('should show the correct page', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'index' does not exist on type '({ prison... Remove this comment to see the full error message
      await controller.index(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
      expect(res.render).toBeCalledWith('appointmentDeleted.njk', {
        multipleDeleted: false,
      })
    })
  })

  describe('when multiple appointments are deleted', () => {
    const req = {
      query: { multipleDeleted: 'true' },
    }

    it('should show the correct page', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'index' does not exist on type '({ prison... Remove this comment to see the full error message
      await controller.index(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
      expect(res.render).toBeCalledWith('appointmentDeleted.njk', {
        multipleDeleted: true,
      })
    })
  })
})
