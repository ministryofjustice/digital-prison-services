import React from 'react'
import { shallow, mount } from 'enzyme'
import moment from 'moment'
import DateOfBirth from './DateOfBirth'

describe('DateOfBirth', () => {
  it('Should render', () => {
    const component = shallow(<DateOfBirth />)
  })

  it('handleDateOfBirthChange is called during initialisation', () => {
    const handleDateOfBirthChange = jest.fn()
    const dob = shallow(<DateOfBirth handleDateOfBirthChange={handleDateOfBirthChange} />)
    expect(handleDateOfBirthChange).toHaveBeenCalledWith({ valid: false, blank: true })
  })

  it('Entering parts of a date calls handleDateOfBirthChange with new outputs', () => {
    const handleDateOfBirthChange = jest.fn()
    const dob = mount(<DateOfBirth handleDateOfBirthChange={handleDateOfBirthChange} />)
    expect(handleDateOfBirthChange).toHaveBeenCalledWith({ valid: false, blank: true })
    dob
      .find('input[type="number"]')
      .at(0)
      .simulate('change', { target: { value: '1' } })
    expect(handleDateOfBirthChange).toHaveBeenCalledWith({ valid: false, blank: false })
    dob
      .find('input[type="number"]')
      .at(1)
      .simulate('change', { target: { value: '1' } })
    expect(handleDateOfBirthChange).toHaveBeenCalledWith({ valid: false, blank: false })
    dob
      .find('input[type="number"]')
      .at(2)
      .simulate('change', { target: { value: '2000' } })
    expect(handleDateOfBirthChange).toHaveBeenCalledWith({ valid: true, blank: false, isoDate: '2000-01-01' })
  })

  it('Does not report errors by default', () => {
    const handleDateOfBirthChange = jest.fn()
    const dob = mount(<DateOfBirth handleDateOfBirthChange={handleDateOfBirthChange} />)
    expect(handleDateOfBirthChange).toHaveBeenCalledWith({ valid: false, blank: true })
    dob
      .find('input[type="number"]')
      .at(0)
      .simulate('change', { target: { value: '1' } })
    expect(dob.instance().errorText()).toBeUndefined()
  })

  it('Will report errors', () => {
    const handleDateOfBirthChange = jest.fn()
    const dob = mount(<DateOfBirth handleDateOfBirthChange={handleDateOfBirthChange} showErrors />)
    expect(handleDateOfBirthChange).toHaveBeenCalledWith({ valid: false, blank: true })
    dob
      .find('input[type="number"]')
      .at(0)
      .simulate('change', { target: { value: '1' } })
    expect(dob.instance().errorText()).toEqual('Enter a real date of birth')
  })

  it('Will rejects date before 1900-01-01', () => {
    const handleDateOfBirthChange = jest.fn()
    const dob = mount(<DateOfBirth handleDateOfBirthChange={handleDateOfBirthChange} showErrors />)
    expect(handleDateOfBirthChange).toHaveBeenCalledWith({ valid: false, blank: true })

    const textinputs = dob.find('input[type="number"]')
    textinputs.at(0).simulate('change', { target: { value: '31' } })
    textinputs.at(1).simulate('change', { target: { value: '12' } })
    textinputs.at(2).simulate('change', { target: { value: '1899' } })

    expect(dob.instance().errorText()).toEqual('Date of birth must be after 1 January 1900')
  })

  it('Accepts 1900-01-01', () => {
    const handleDateOfBirthChange = jest.fn()
    const dob = mount(<DateOfBirth handleDateOfBirthChange={handleDateOfBirthChange} showErrors />)
    expect(handleDateOfBirthChange).toHaveBeenCalledWith({ valid: false, blank: true })

    const textinputs = dob.find('input[type="number"]')
    textinputs.at(0).simulate('change', { target: { value: '1' } })
    textinputs.at(1).simulate('change', { target: { value: '1' } })
    textinputs.at(2).simulate('change', { target: { value: '1900' } })

    expect(dob.instance().errorText()).toBeUndefined()
    expect(handleDateOfBirthChange).toHaveBeenCalledWith({ valid: true, blank: false, isoDate: '1900-01-01' })
  })

  it('Accepts yesterday', () => {
    const handleDateOfBirthChange = jest.fn()
    const dob = mount(<DateOfBirth handleDateOfBirthChange={handleDateOfBirthChange} showErrors />)
    expect(handleDateOfBirthChange).toHaveBeenCalledWith({ valid: false, blank: true })

    const yesterday = moment().subtract(1, 'days')

    const textinputs = dob.find('input[type="number"]')
    textinputs.at(0).simulate('change', { target: { value: yesterday.date() } })
    textinputs.at(1).simulate('change', { target: { value: yesterday.month() + 1 } })
    textinputs.at(2).simulate('change', { target: { value: yesterday.year() } })

    expect(dob.instance().errorText()).toBeUndefined()
    expect(handleDateOfBirthChange).toHaveBeenCalledWith({
      valid: true,
      blank: false,
      isoDate: yesterday.format('YYYY-MM-DD'),
    })
  })

  it('Rejects today', () => {
    const handleDateOfBirthChange = jest.fn()
    const dob = mount(<DateOfBirth handleDateOfBirthChange={handleDateOfBirthChange} showErrors />)
    expect(handleDateOfBirthChange).toHaveBeenCalledWith({ valid: false, blank: true })

    const today = moment()

    const textinputs = dob.find('input[type="number"]')
    textinputs.at(0).simulate('change', { target: { value: today.date() } })
    textinputs.at(1).simulate('change', { target: { value: today.month() + 1 } })
    textinputs.at(2).simulate('change', { target: { value: today.year() } })

    expect(dob.instance().errorText()).toEqual('Date of birth must be in the past')
    expect(handleDateOfBirthChange).toHaveBeenCalledWith({ valid: false, blank: false })
  })
})
