Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')
const bulkAppointmentsFormRedirect = require('../controllers/bulkAppointmentsFormRedirect')

const mockRes = { redirect: jest.fn() }

describe('index', () => {
  const res = { ...mockRes }
  const req = {
    session: {
      data: {
        location: 1,
        locationDescription: 'location 1',
        appointmentType: 'app1',
        appointmentTypeDescription: 'appointment 1',
        sameTimeAppointments: 'yes',
        recurring: 'yes',
        times: 1,
        repeatsText: 'Daily',
        repeats: 'DAILY',
        comments: 'test',
      },
    },
  }

  it('should clear the saved session data and redirect to the add appointments page', async () => {
    await bulkAppointmentsFormRedirect(req, res)
    expect(req.session.data).toEqual([])
    expect(res.redirect).toBeCalledWith('/bulk-appointments/add-appointment-details')
  })
})
