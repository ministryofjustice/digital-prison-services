import { thenComparing, fieldComparator } from '../tablesorting/comparatorComposition'
import { getEventDescription } from '../utils'
import { DESC } from '../tablesorting/sortOrder'
import { ACTIVITY, CELL_LOCATION, LAST_NAME } from '../tablesorting/sortColumns'

const activityLastNameComparator = thenComparing(
  thenComparing(fieldComparator(obj => obj.lastName), fieldComparator(obj => obj.firstName)),
  fieldComparator(obj => obj.offenderNo)
)

const activityComparators = {
  [LAST_NAME]: activityLastNameComparator,
  [CELL_LOCATION]: thenComparing(fieldComparator(obj => obj.cellLocation), activityLastNameComparator),
  [ACTIVITY]: thenComparing(fieldComparator(obj => getEventDescription(obj)), activityLastNameComparator),
}

const sortActivityData = (activityData, sortColumn, sortOrder) => {
  activityData.sort(activityComparators[sortColumn])
  if (sortOrder === DESC) {
    activityData.reverse()
  }
}

export default sortActivityData
