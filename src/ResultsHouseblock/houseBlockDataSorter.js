import { getEventDescription } from '../utils'

const fieldExtractor = field => {
  const anyActivity = obj => obj.activity || obj.others[0]
  switch (field) {
    case 'firstName':
      return obj => anyActivity(obj).firstName
    case 'lastName':
      return obj => anyActivity(obj).lastName
    case 'cellLocation':
      return obj => anyActivity(obj).cellLocation
    case 'activity':
      return obj => getEventDescription(obj.activity)
    default:
      return obj => anyActivity(obj).lastName
  }
}

const fieldComparator = field => {
  const extractor = fieldExtractor(field)
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

const comparatorFor = field => {
  switch (field) {
    case 'lastName':
      return thenComparing(fieldComparator('lastName'), fieldComparator('firstName'))
    case 'cellLocation':
      return fieldComparator('cellLocation')
    case 'activity':
      return thenComparing(fieldComparator('activity'), comparatorFor('lastName'))
    default:
      return comparatorFor('lastName')
  }
}

const comparators = {
  lastName: thenComparing(fieldComparator('lastName'), fieldComparator('firstName')),
  cellLocation: fieldComparator('cellLocation'),
  activity: thenComparing(fieldComparator('activity'), comparatorFor('lastName')),
}

const sortHouseBlockData = (houseBlockData, orderField, sortOrder) => {
  houseBlockData.sort(comparators[orderField])
  if (sortOrder === 'DESC') {
    houseBlockData.reverse()
  }
}

export default sortHouseBlockData
