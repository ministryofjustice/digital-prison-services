import React from 'react'
import PropTypes from 'prop-types'
import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'
import SortableColumn from '../tablesorting/SortableColumn'
import OffenderName from '../OffenderName'
import DateFormatter from '../DateFormatter'
import OffenderImage from '../OffenderImage'
import SortLov from '../tablesorting/SortLov'
import HoursAndMinutes from '../HoursAndMinutes'
import { LAST_NAME } from '../tablesorting/sortColumns'
import Flags from '../FullFlags/Flags'

const EnRoute = ({ rows, sortOrder, setColumnSort }) => (
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
          <th className="straight width15">
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
          <th className="straight width10">Departed</th>
          <th className="straight width15">En route from</th>
          <th className="straight width15">Reason</th>
          <th className="straight width25">Flags</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr
            className="row-gutters"
            key={[row.offenderNo, row.fromAgencyDescription, row.movementsOut, row.location, row.toAgencyId].join('_')}
          >
            <td className="row-gutters">
              <OffenderImage offenderNo={row.offenderNo} />
            </td>
            <td className="row-gutters">
              <OffenderName lastName={row.lastName} firstName={row.firstName} />
            </td>
            <td className="row-gutters">{row.offenderNo}</td>
            <td className="row-gutters">
              <DateFormatter isoDate={row.dateOfBirth} />
            </td>
            <td>
              <div>
                <HoursAndMinutes hhmmss={row.movementTime} />
              </div>
              <DateFormatter isoDate={row.movementDate} />
            </td>
            <td>{row.fromAgencyDescription}</td>
            <td>{row.movementReasonDescription}</td>
            <td className="row-gutters">
              <Flags alerts={row.alerts} category={row.category} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
)

EnRoute.propTypes = {
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      offenderNo: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      location: PropTypes.string,
      movementTime: PropTypes.string,
      movementDate: PropTypes.string,
      fromAgencyDescription: PropTypes.string,
      movementReasonDescription: PropTypes.string,
      alerts: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
      category: PropTypes.string,
    })
  ),
  sortOrder: PropTypes.string,
  setColumnSort: PropTypes.func,
}
EnRoute.defaultProps = {
  rows: [],
  sortOrder: '',
  setColumnSort: () => {},
}

export default EnRoute
