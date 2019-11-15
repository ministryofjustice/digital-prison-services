const attendanceUpdated = (offenderAttendanceData, agencyId) => {
  const { paid, other, absentReason } = offenderAttendanceData

  return {
    category: 'Pay and attendance',
    action: `Offender ${paid ? 'paid' : 'not paid'} at ${agencyId}`,
    label: other ? `Other - ${absentReason.value}` : 'Pay',
  }
}

const attendAll = (numberOfOffenders, agencyId) => {
  return {
    category: 'Pay and attendance',
    action: `Bulk pay at ${agencyId}`,
    label: 'Pay',
    value: numberOfOffenders,
  }
}

const allNotRequired = (numberOfOffenders, agencyId) => {
  return {
    category: 'Pay and attendance',
    action: `Bulk not required at ${agencyId}`,
    label: 'Other - Not Required',
    value: numberOfOffenders,
  }
}

module.exports = {
  attendanceUpdated,
  attendAll,
  allNotRequired,
}
