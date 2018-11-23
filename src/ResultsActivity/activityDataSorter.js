import { getEventDescription } from '../utils'

const fieldExtractor = {
  firstName: obj => obj.firstName,
  lastName: obj => obj.lastName,
  cellLocation: obj => obj.cellLocation,
  activity: obj => getEventDescription(obj),
}

const fieldComparator = field => {
  const extractor = fieldExtractor[field]
  return (a, b) => {
    const x = extractor(a)
    const y = extractor(b)
    if (x === y) return 0
    return x < y ? -1 : 1
  }
}

const thenComparing = (compareFirst, compareNext) => (a, b) => {
  const res = compareFirst(a, b)
  return res !== 0 ? res : compareNext(a, b)
}

const lastNameComparator = thenComparing(fieldComparator('lastName'), fieldComparator('firstName'))

const comparators = {
  lastName: lastNameComparator,
  cellLocation: thenComparing(fieldComparator('cellLocation'), lastNameComparator),
  activity: thenComparing(fieldComparator('activity'), lastNameComparator),
}

const sortActivityData = (activityData, orderField, sortOrder) => {
  activityData.sort(comparators[orderField])
  if (sortOrder === 'DESC') {
    activityData.reverse()
  }
}

export default sortActivityData
