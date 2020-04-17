const getComment = event => (event.eventSubType === 'PA' ? null : event.eventSourceDesc)

module.exports = event => {
  const comment = getComment(event)

  return {
    type: (event.eventSubType === 'PA' && event.eventSourceDesc) || event.eventSubTypeDesc,
    comment,
    shortComment: comment && comment.length > 40 ? `${comment.substring(0, 40)}...` : comment,
    startTime: event.startTime,
    endTime: event.endTime,
    cancelled: event.eventStatus === 'CANC',
    eventStatus: event.eventStatus,
  }
}
