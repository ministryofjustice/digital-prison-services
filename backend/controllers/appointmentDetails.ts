import { formatName } from '../utils'
import config, { app } from '../config'

export default ({ oauthApi, prisonApi, whereaboutsApi, appointmentDetailsService }) =>
  async (req, res) => {
    const { id } = req.params
    const { activeCaseLoadId } = req.session.userDetails

    const appointmentDetails = await whereaboutsApi.getAppointment(res.locals, id)

    const [prisonerDetails, appointmentViewModel] = await Promise.all([
      prisonApi.getDetails(res.locals, appointmentDetails.appointment.offenderNo),
      appointmentDetailsService.getAppointmentViewModel(res, appointmentDetails, activeCaseLoadId),
    ])

    const { additionalDetails, basicDetails, prepostData, recurringDetails, timeDetails, canAmendVlb } =
      appointmentViewModel

    const userRoles = oauthApi.userRoles(res.locals)

    const canAmendAppointment =
      userRoles &&
      userRoles.some(
        (role) => role.roleCode === 'ACTIVITY_HUB' || role.roleCode === 'DELETE_A_PRISONERS_APPOINTMENT'
      ) &&
      canAmendVlb

    return res.render('appointmentDetails', {
      appointmentConfirmDeletionLink: canAmendAppointment && `/appointment-details/${id}/confirm-deletion`,
      appointmentAmendLink:
        canAmendAppointment &&
        app.bvlsMasteredAppointmentTypes.includes(appointmentDetails.appointment.appointmentTypeCode) &&
        `${config.app.prisonerProfileRedirect.url}/prisoner/${appointmentDetails.appointment.offenderNo}/edit-appointment/${id}`,
      additionalDetails,
      basicDetails,
      prepostData,
      prisoner: {
        name: prisonerDetails && formatName(prisonerDetails.firstName, prisonerDetails.lastName),
        number: prisonerDetails?.offenderNo,
      },
      recurringDetails,
      timeDetails,
    })
  }
