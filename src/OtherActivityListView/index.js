import React from 'react'
import PropTypes from 'prop-types'
import { getHoursMinutes, getEventDescription } from '../utils'

const shouldShowOtherActivities = offenderMainEvent =>
  Boolean(
    offenderMainEvent &&
      ((offenderMainEvent.activities && offenderMainEvent.activities.length > 1) ||
        offenderMainEvent.others ||
        offenderMainEvent.releaseScheduled ||
        offenderMainEvent.courtEvents ||
        offenderMainEvent.scheduledTransfers)
  )

const renderOtherEvent = (event, index) => {
  const parts = [
    getHoursMinutes(event.startTime),
    event.event !== 'VISIT' && event.endTime && getHoursMinutes(event.endTime),
    getEventDescription(event),
  ]
  const text = parts.filter(part => !!part).join(' - ')
  const key = `${event.offenderNo}_others_${index}`
  const cancelled = event.event === 'VISIT' && event.eventStatus === 'CANC'

  if (cancelled) {
    return (
      <li key={key}>
        {text} <span className="cancelled">(cancelled)</span>
      </li>
    )
  }

  return <li key={key}>{text}</li>
}
const renderEvent = (event, type, index) => (
  <li className="transfer" key={`${type}_${index}`}>
    <strong className="other-activity">{event.eventDescription}</strong>
    {event.expired && <span className="cancelled">{`${' (expired)'}`}</span>}
    {event.complete && <span className="complete">{`${' (complete)'}`}</span>}
    {event.cancelled && <span className="cancelled">{`${' (cancelled)'}`}</span>}
  </li>
)

const OtherActivityListView = ({ offenderMainEvent }) => {
  const otherActivities = offenderMainEvent.activities
    ? offenderMainEvent.activities.filter(activity => !activity.mainActivity)
    : offenderMainEvent.others

  return (
    shouldShowOtherActivities(offenderMainEvent) && (
      <ul>
        {offenderMainEvent.releaseScheduled && (
          <li key="release">
            <strong className="other-activity">Release scheduled</strong>
          </li>
        )}
        {offenderMainEvent.courtEvents &&
          offenderMainEvent.courtEvents.map((event, index) => renderEvent(event, 'court', index))}
        {offenderMainEvent.scheduledTransfers &&
          offenderMainEvent.scheduledTransfers.map((event, index) => renderEvent(event, 'transfer', index))}
        {otherActivities && otherActivities.map((event, index) => renderOtherEvent(event, index))}
      </ul>
    )
  )
}

OtherActivityListView.propTypes = {
  offenderMainEvent: PropTypes.shape({
    courtEvents: PropTypes.arrayOf(
      PropTypes.shape({
        eventId: PropTypes.number,
        eventDescription: PropTypes.string,
        expired: PropTypes.bool,
        complete: PropTypes.bool,
        cancelled: PropTypes.bool,
      }).isRequired
    ),
    scheduledTransfers: PropTypes.arrayOf(
      PropTypes.shape({
        eventId: PropTypes.number,
        eventDescription: PropTypes.string,
        expired: PropTypes.bool,
        complete: PropTypes.bool,
        cancelled: PropTypes.bool,
      }).isRequired
    ),
    activities: PropTypes.arrayOf(
      PropTypes.shape({
        offenderNo: PropTypes.string.isRequired,
        firstName: PropTypes.string.isRequired,
        lastName: PropTypes.string.isRequired,
        eventId: PropTypes.number,
        cellLocation: PropTypes.string.isRequired,
        others: PropTypes.array,
        event: PropTypes.string.isRequired,
        eventType: PropTypes.string,
        eventDescription: PropTypes.string.isRequired,
        eventStatus: PropTypes.string,
        comment: PropTypes.string,
      })
    ),
    others: PropTypes.arrayOf(
      PropTypes.shape({
        offenderNo: PropTypes.string,
        eventId: PropTypes.number,
        event: PropTypes.string,
        eventType: PropTypes.string,
        eventDescription: PropTypes.string,
        eventStatus: PropTypes.string,
        comment: PropTypes.string,
        startTime: PropTypes.string,
      }).isRequired
    ),
    releaseScheduled: PropTypes.bool,
  }).isRequired,
}

export default OtherActivityListView
