import { thenComparing, fieldComparator } from '../ResultsHouseblock/comparatorComposition'
import { getEventDescription } from '../utils'

const activityLastNameComparator = thenComparing(
  fieldComparator(obj => obj.lastName),
  fieldComparator(obj => obj.firstName)
)

const activityComparators = {
  lastName: activityLastNameComparator,
  cellLocation: thenComparing(fieldComparator(obj => obj.cellLocation), activityLastNameComparator),
  activity: thenComparing(fieldComparator(obj => getEventDescription(obj)), activityLastNameComparator),
}

const sortActivityData = (activityData, orderField, sortOrder) => {
  activityData.sort(activityComparators[orderField])
  if (sortOrder === 'DESC') {
    activityData.reverse()
  }
}

export default sortActivityData
