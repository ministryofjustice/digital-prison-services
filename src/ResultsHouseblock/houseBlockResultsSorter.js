import { thenComparing, fieldComparator } from '../tablesorting/comparatorComposition'
import { getEventDescription } from '../utils'
import { DESC } from '../tablesorting/sortOrder'
import { ACTIVITY, CELL_LOCATION, LAST_NAME } from '../tablesorting/sortColumns'

const mainActivity = activities => activities.find(activity => activity.mainActivity)
const anyHouseBlockActivity = obj => mainActivity(obj.activities) || obj.activities[0]

const houseBlockLastNameComparator = thenComparing(
  thenComparing(
    fieldComparator(obj => anyHouseBlockActivity(obj).lastName),
    fieldComparator(obj => anyHouseBlockActivity(obj).firstName)
  ),
  fieldComparator(obj => anyHouseBlockActivity(obj).offenderNo)
)
const houseBlockComparators = {
  [LAST_NAME]: houseBlockLastNameComparator,
  [CELL_LOCATION]: thenComparing(
    fieldComparator(obj => anyHouseBlockActivity(obj).cellLocation),
    houseBlockLastNameComparator
  ),
  [ACTIVITY]: thenComparing(
    fieldComparator(obj => (mainActivity(obj.activities) ? getEventDescription(mainActivity(obj.activities)) : '')),
    houseBlockLastNameComparator
  ),
}

const sortHouseBlockData = (houseBlockData, sortColumn, sortOrder) => {
  houseBlockData.sort(houseBlockComparators[sortColumn])
  if (sortOrder === DESC) {
    houseBlockData.reverse()
  }
}

export default sortHouseBlockData
