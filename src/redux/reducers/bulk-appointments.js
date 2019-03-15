import * as ActionTypes from '../actions/actionTypes'

const initialState = {
  appointmentDetails: {},
  prisoners: [],
}

const mapToAppointmentDetails = appointmentDetails => {
  const {
    date,
    appointmentType,
    appointmentTypes,
    location,
    locationTypes,
    startTime,
    endTime,
    comments,
    recurring,
    repeats,
    times,
    recurringEndDate,
  } = appointmentDetails

  return {
    date,
    appointmentType,
    location,
    startTime,
    endTime,
    comments,
    appointmentTypeDescription: appointmentTypes.find(apt => apt.id === appointmentType).description,
    locationDescription: locationTypes.find(loc => loc.id === Number(location)).description,
    recurring,
    times,
    repeats,
    recurringEndDate,
  }
}

export default function content(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.SET_BULK_APPOINTMENT_DETAILS:
      return {
        ...state,
        appointmentDetails: mapToAppointmentDetails(action.appointmentDetails),
      }
    case ActionTypes.SET_BULK_APPOINTMENT_PRISONERS:
      return {
        ...state,
        prisoners: action.prisoners,
      }
    case ActionTypes.SET_BULK_APPOINTMENTS_COMPLETE:
      return {
        ...initialState,
      }
    default:
      return state
  }
}
