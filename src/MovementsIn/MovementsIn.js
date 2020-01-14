import React from 'react'
import PropTypes from 'prop-types'
import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'
import SortableColumn from '../tablesorting/SortableColumn'
import OffenderName from '../OffenderName'
import DateFormatter from '../DateFormatter'
import OffenderLink from '../OffenderLink'
import OffenderImage from '../OffenderImage'
import SortLov from '../tablesorting/SortLov'
import Location from '../Location'
import HoursAndMinutes from '../HoursAndMinutes'
import { LAST_NAME } from '../tablesorting/sortColumns'
import Flags from '../FullFlags/Flags'

const shouldBeClickable = (row, agencyId) => Boolean(row && row.toAgencyId === agencyId && row.location)

const withLink = (row, activeCaseLoadId, element) => {
  if (shouldBeClickable(row, activeCaseLoadId)) {
    return <OffenderLink offenderNo={row.offenderNo}>{element}</OffenderLink>
  }
  return element
}

const MovementsIn = ({ rows, sortOrder, setColumnSort, agencyId }) => (
  <>
    <GridRow>
      <GridCol setWidth="one-quarter">
        <SortLov sortColumns={[LAST_NAME]} sortColumn={LAST_NAME} sortOrder={sortOrder} setColumnSort={setColumnSort} />
      </GridCol>
    </GridRow>
    <table>
      <thead>
        <tr>
          {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
          <th className="straight width10" />
          <th className="straight width10">
            <SortableColumn
              heading="Name"
              column={LAST_NAME}
              sortOrder={sortOrder}
              setColumnSort={setColumnSort}
              sortColumn={LAST_NAME}
            />
          </th>
          <th className="straight width10">Prison no.</th>
          <th className="straight width10">D.O.B.</th>
          <th className="straight width10">Incentive Level</th>
          <th className="straight width10">Location</th>
          <th className="straight width10">Time in</th>
          <th className="straight width15">Arrived from</th>
          <th className="straight width15">Flags</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr
            className="row-gutters"
            key={[row.offenderNo, row.fromAgencyDescription, row.movementsOut, row.location, row.toAgencyId].join('_')}
          >
            <td className="row-gutters">{withLink(row, agencyId, <OffenderImage offenderNo={row.offenderNo} />)}</td>
            <td className="row-gutters">
              {withLink(row, agencyId, <OffenderName lastName={row.lastName} firstName={row.firstName} />)}
            </td>
            <td className="row-gutters">{row.offenderNo}</td>
            <td className="row-gutters">
              <DateFormatter isoDate={row.dateOfBirth} />
            </td>
            <td>{row.iepLevel}</td>
            <td className="row-gutters">
              <Location location={row.location} />
            </td>
            <td>
              <HoursAndMinutes hhmmss={row.movementTime} />
            </td>
            <td>{row.fromAgencyDescription || row.fromCity}</td>
            <td className="row-gutters">
              <Flags offenderNo={row.offenderNo} alerts={row.alerts} category={row.category} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
)

MovementsIn.propTypes = {
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      offenderNo: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      location: PropTypes.string,
      movementTime: PropTypes.string,
      fromAgencyDescription: PropTypes.string,
      alerts: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
      category: PropTypes.string,
      fromCity: PropTypes.string,
    })
  ),
  sortOrder: PropTypes.string,
  setColumnSort: PropTypes.func,
  agencyId: PropTypes.string,
}
MovementsIn.defaultProps = {
  rows: [],
  sortOrder: '',
  setColumnSort: () => {},
  agencyId: '',
}

export default MovementsIn
