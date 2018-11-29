import moment from 'moment'
import { getListSizeClass, getLongDateFormat } from './utils'

describe('getListSizeClass()', () => {
  it('should return empty-list if no list provided', () => {
    expect(getListSizeClass()).toEqual('empty-list')
  })

  it('should return empty-list if provided array is empty', () => {
    const list = []
    expect(getListSizeClass(list)).toEqual('empty-list')
  })

  it('should return small-list if provided array has less than 20 entries', () => {
    const list = new Array(19)
    expect(getListSizeClass(list)).toEqual('small-list')
  })

  it('should return medium-list if provided array has less than 40 entries', () => {
    const list = new Array(39)
    expect(getListSizeClass(list)).toEqual('medium-list')
  })

  it('should return large-list if provided array has 40 or more entries', () => {
    const list = new Array(40)
    expect(getListSizeClass(list)).toEqual('large-list')
  })
})

describe('getLongDateFormat()', () => {
  it('should return Todays date in the long format by default', () => {
    const todaysLongDate = moment().format('dddd Do MMMM')

    expect(getLongDateFormat()).toEqual(todaysLongDate)
    expect(getLongDateFormat('Today')).toEqual(todaysLongDate)
  })

  it('should return the provided date in the desired long format starting with day name', () => {
    expect(getLongDateFormat('28/11/2018')).toEqual('Wednesday 28th November')
  })
})
