import { shape, string, bool, oneOfType, arrayOf, node, number, instanceOf } from 'prop-types'
import moment from 'moment'

export const childrenType = oneOfType([arrayOf(node), node])

export const metaType = shape({ touched: bool, error: string })
export const inputType = shape({ name: string.isRequired, value: string })

export const routeMatchType = shape({
  isExact: bool.isRequired,
  path: string.isRequired,
  url: string.isRequired,
})

export const appointmentType = shape({
  locationId: number.isRequired,
  appointmentType: string.isRequired,
  startTime: string.isRequired,
  endTime: instanceOf(moment),
  comments: string,
})
