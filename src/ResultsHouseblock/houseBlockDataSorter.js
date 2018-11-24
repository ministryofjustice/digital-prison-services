import { getEventDescription } from '../utils'

const anyActivity = obj => obj.activity || obj.others[0]

const fieldExtractor = {
  firstName: obj => anyActivity(obj).firstName,
  lastName: obj => anyActivity(obj).lastName,
  cellLocation: obj => anyActivity(obj).cellLocation,
  activity: obj => (obj.activity ? getEventDescription(obj.activity) : ''),
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

const sortHouseBlockData = (houseBlockData, orderField, sortOrder) => {
  houseBlockData.sort(comparators[orderField])
  if (sortOrder === 'DESC') {
    houseBlockData.reverse()
  }
}

export default sortHouseBlockData
