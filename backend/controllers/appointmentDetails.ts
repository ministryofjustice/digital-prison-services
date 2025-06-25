import { formatName } from '../utils'
import config from '../config'

export default ({ oauthApi, prisonApi, whereaboutsApi, appointmentDetailsService, systemOauthClient }) =>
  async (req, res) => {
    const { id } = req.params
    const { activeCaseLoadId } = req.session.userDetails

    const appointmentDetails = await whereaboutsApi.getAppointment(res.locals, id)
    const context = await systemOauthClient.getClientCredentialsTokens(req.session.userDetails.username)

    const [prisonerDetails, appointmentViewModel] = await Promise.all([
      prisonApi.getDetails(res.locals, appointmentDetails.appointment.offenderNo),
      appointmentDetailsService.getAppointmentViewModel(context, res, appointmentDetails, activeCaseLoadId),
    ])

    const {
      additionalDetails,
      basicDetails,
      prepostData,
      recurringDetails,
      timeDetails,
      canAmendAppointment,
      canDeleteAppointment,
    } = appointmentViewModel

    const userRoles = oauthApi.userRoles(res.locals)

    const canAmend =
      userRoles &&
      userRoles.some(
        (role) => role.roleCode === 'ACTIVITY_HUB' || role.roleCode === 'DELETE_A_PRISONERS_APPOINTMENT'
      ) &&
      canAmendAppointment

    const canDelete =
      userRoles &&
      userRoles.some(
        (role) => role.roleCode === 'ACTIVITY_HUB' || role.roleCode === 'DELETE_A_PRISONERS_APPOINTMENT'
      ) &&
      canDeleteAppointment

    return res.render('appointmentDetails', {
      appointmentConfirmDeletionLink: canDelete && `/appointment-details/${id}/confirm-deletion`,
      appointmentAmendLink:
        canAmend &&
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
