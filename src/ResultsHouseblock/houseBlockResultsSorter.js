import { thenComparing, fieldComparator } from './comparatorComposition'
import { getEventDescription } from '../utils'

const anyHouseBlockActivity = obj => obj.activity || obj.others[0]

const houseBlockLastNameComparator = thenComparing(
  fieldComparator(obj => anyHouseBlockActivity(obj).lastName),
  fieldComparator(obj => anyHouseBlockActivity(obj).firstName)
)

const houseBlockComparators = {
  lastName: houseBlockLastNameComparator,
  cellLocation: thenComparing(
    fieldComparator(obj => anyHouseBlockActivity(obj).cellLocation),
    houseBlockLastNameComparator
  ),
  activity: thenComparing(
    fieldComparator(obj => (obj.activity ? getEventDescription(obj.activity) : '')),
    houseBlockLastNameComparator
  ),
}

const sortHouseBlockData = (houseBlockData, orderField, sortOrder) => {
  houseBlockData.sort(houseBlockComparators[orderField])
  if (sortOrder === 'DESC') {
    houseBlockData.reverse()
  }
}

export default sortHouseBlockData
