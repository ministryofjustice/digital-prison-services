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
    action: `${numberOfOffenders} offenders bulk paid at ${agencyId}`,
    label: 'Pay',
  }
}

const allNotRequired = (numberOfOffenders, agencyId) => {
  return {
    category: 'Pay and attendance',
    action: `${numberOfOffenders} offenders bulk not required at ${agencyId}`,
    label: 'Other - Not Required',
  }
}

module.exports = {
  attendanceUpdated,
  attendAll,
  allNotRequired,
}
