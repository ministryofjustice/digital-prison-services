import { shape, string, bool, oneOfType, arrayOf, node, number } from 'prop-types'

export const childrenType = oneOfType([arrayOf(node), node])

export const metaType = shape({ touched: bool, error: string })
export const inputType = shape({ name: string.isRequired, value: string })

export const routeMatchType = shape({
  isExact: bool.isRequired,
  path: string.isRequired,
  url: string.isRequired,
})

export const appointmentType = shape({
  locationId: number,
  appointmentType: string,
  startTime: string,
  endTime: string,
  comments: string,
})

const caseLoadOptions = shape({
  caseLoadId: string,
  caseloadFunction: string,
  description: string,
  type: string,
})

export const userType = shape({
  activeCaseLoadId: string,
  caseLoadOptions: arrayOf(caseLoadOptions),
  expiredFlag: bool,
  firstName: string,
  lastName: string,
  lockedFlag: bool,
  maintainAccess: bool,
  maintainAccessAdmin: bool,
  migration: bool,
  staffId: number,
  username: string,
  writeAccess: bool,
})
