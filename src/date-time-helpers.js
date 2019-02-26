import moment from 'moment'

export const DATE_TIME_FORMAT_SPEC = 'YYYY-MM-DDTHH:mm:ss'
export const DATE_ONLY_FORMAT_SPEC = 'YYYY-MM-DD'

export const formatDateAndTime = ({ date, time }) => `${moment(date).format(DATE_ONLY_FORMAT_SPEC)}T${time}`
