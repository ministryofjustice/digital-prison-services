import appointmentDeleted from '../controllers/appointmentDeleted'

const res = { locals: {}, send: jest.fn(), redirect: jest.fn(), render: jest.fn() }

let controller

beforeEach(() => {
  controller = appointmentDeleted()

  res.render = jest.fn()
})

describe('appointment deleted', () => {
  describe('when one appointment is deleted', () => {
    const req = {
      query: {},
    }

    it('should show the correct page', async () => {
      await controller.index(req, res)

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

      expect(res.render).toBeCalledWith('appointmentDeleted.njk', {
        multipleDeleted: true,
      })
    })
  })
})
