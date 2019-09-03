const attendanceUpdated = (offenderAttendanceData, agencyId) => {
  const { paid, other, absentReason } = offenderAttendanceData

  return {
    category: 'Pay and attendance',
    action: `Offender ${paid ? 'paid' : 'not paid'} at ${agencyId}`,
    label: other ? `Other - ${absentReason.value}` : 'Pay',
  }
}

module.exports = {
  attendanceUpdated,
}
