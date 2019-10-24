Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')
const bulkAppointmentsFormRedirect = require('../controllers/bulkAppointmentsFormRedirect')

const mockRes = { redirect: jest.fn() }

describe('add appointment redirect', () => {
  const res = { ...mockRes }
  const req = {
    session: {},
  }

  it('should redirect to the add appointments page', async () => {
    await bulkAppointmentsFormRedirect(req, res)
    expect(res.redirect).toBeCalledWith('/bulk-appointments/add-appointment-details')
  })
})
