import { attendanceUpdated, attendAll, allNotRequired } from './attendanceGAEvents'

describe('Pay and attendance GA events', () => {
  it('should create a GA event when an offender is paid without an issue', () => {
    const offenderAttendanceData = {
      paid: true,
    }

    expect(attendanceUpdated(offenderAttendanceData, 'MDI')).toEqual({
      category: 'Pay and attendance',
      action: 'Offender paid at MDI',
      label: 'Pay',
    })
  })

  it('should create a GA event when an offender is paid via other', () => {
    const offenderAttendanceData = {
      paid: true,
      absentReason: {
        value: 'AcceptableAbsence',
        name: 'Acceptable',
      },
      other: true,
    }

    expect(attendanceUpdated(offenderAttendanceData, 'MDI')).toEqual({
      category: 'Pay and attendance',
      action: `Offender paid at MDI`,
      label: 'Other - AcceptableAbsence',
    })
  })

  it('should create a GA event when an offender is not paid', () => {
    const offenderAttendanceData = {
      paid: false,
      absentReason: {
        value: 'UnacceptableAbsence',
        name: 'Unacceptable',
      },
      other: true,
    }

    expect(attendanceUpdated(offenderAttendanceData, 'MDI')).toEqual({
      category: 'Pay and attendance',
      action: `Offender not paid at MDI`,
      label: 'Other - UnacceptableAbsence',
    })
  })

  it('should raise a GA event when attending all', () => {
    expect(attendAll(10, 'MDI')).toEqual({
      category: 'Pay and attendance',
      action: `10 offenders bulk paid at MDI`,
      label: 'Pay',
    })
  })

  it('should raise a GA event when all not required', () => {
    expect(allNotRequired(10, 'MDI')).toEqual({
      category: 'Pay and attendance',
      action: `10 offenders bulk not required at MDI`,
      label: 'Other - Not Required',
    })
  })
})
