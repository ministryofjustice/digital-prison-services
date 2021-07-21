import appointmentDeleted from '../controllers/appointmentDeleted'

const res = { locals: {}, send: jest.fn(), redirect: jest.fn() }

let controller

beforeEach(() => {
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
      await controller.index(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
      expect(res.render).toBeCalledWith('appointmentDeleted.njk', {
        multipleDeleted: true,
      })
    })
  })
})
