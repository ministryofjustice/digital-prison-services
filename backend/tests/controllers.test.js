import { factory } from '../controllers/controller'

describe('Controllers', () => {
  const elite2Api = {}
  beforeEach(() => {
    elite2Api.createAlert = jest.fn()
  })
  describe('Create an alert', () => {
    it('should return a bad request on missing body', async () => {
      const { createAlert } = factory([])
      const req = {
        params: { bookingId: 1 },
        body: undefined,
      }
      const res = {
        status: jest.fn(),
        end: jest.fn(),
      }

      await createAlert(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.end).toHaveBeenCalled()
    })

    it('should call elite2Api.createAlert with the correct parameters', async () => {
      const { createAlert } = factory({ elite2Api })
      const bookingId = 1
      const req = {
        params: { bookingId: 1 },
        body: { effectiveDate: '2019-10-10', alertType: 'A', alertSubType: 'B', comment: 'test' },
      }
      const res = {
        locals: { stuff: 1 },
        status: jest.fn(),
        end: jest.fn(),
      }

      await createAlert(req, res)

      expect(elite2Api.createAlert).toHaveBeenCalledWith(res.locals, bookingId, {
        alertCode: 'B',
        alertDate: '2019-10-10',
        alertType: 'A',
        comment: 'test',
      })
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.end).toHaveBeenCalled()
    })
  })
})
