module.exports = event => {
  const { startTime, endTime, eventStatus, eventSubType, eventSubTypeDesc, eventSourceDesc } = event
  const comment = eventSubType === 'PA' ? null : eventSourceDesc

  return {
    comment,
    startTime,
    endTime,
    eventStatus,
    type: (eventSubType === 'PA' && eventSourceDesc) || eventSubTypeDesc,
    shortComment: comment && comment.length > 40 ? `${comment.substring(0, 40)}...` : comment,
    cancelled: eventStatus === 'CANC',
  }
}
