import { thenComparing, fieldComparator } from '../tablesorting/comparatorComposition'
import { getEventDescription } from '../utils'
import { DESC } from '../tablesorting/sortOrder'
import { ACTIVITY, CELL_LOCATION, LAST_NAME } from '../tablesorting/sortColumns'

const mainActivity = activities => activities.find(activity => activity.mainActivity)
const anyHouseblockActivity = obj => mainActivity(obj.activities) || obj.activities[0]

const houseblockLastNameComparator = thenComparing(
  thenComparing(
    fieldComparator(obj => anyHouseblockActivity(obj).lastName),
    fieldComparator(obj => anyHouseblockActivity(obj).firstName)
  ),
  fieldComparator(obj => anyHouseblockActivity(obj).offenderNo)
)
const houseblockComparators = {
  [LAST_NAME]: houseblockLastNameComparator,
  [CELL_LOCATION]: thenComparing(
    fieldComparator(obj => anyHouseblockActivity(obj).cellLocation),
    houseblockLastNameComparator
  ),
  [ACTIVITY]: thenComparing(
    fieldComparator(obj => (mainActivity(obj.activities) ? getEventDescription(mainActivity(obj.activities)) : '')),
    houseblockLastNameComparator
  ),
}

const sortHouseblockData = (houseblockData, sortColumn, sortOrder) => {
  houseblockData.sort(houseblockComparators[sortColumn])
  if (sortOrder === DESC) {
    houseblockData.reverse()
  }
}

export default sortHouseblockData
