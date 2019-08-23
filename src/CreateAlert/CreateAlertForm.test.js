import React from 'react'
import { shallow } from 'enzyme'
import moment from 'moment'

import { CreateAlertForm } from './CreateAlertForm'
import { DATE_ONLY_FORMAT_SPEC } from '../dateHelpers'

const alerts = {
  alertTypes: [{ title: 'alert 1', value: 'alert-type-1' }],
  alertSubTypes: [{ title: 'alert sub 1', value: 'alert-sub-1', parentValue: 'alert-type-1' }],
}

describe('Create alert form', () => {
  const clickChangeDateLink = wrapper => wrapper.find({ 'data-qa': 'edit-date-link' }).simulate('click', {})
  it('should display required fields errors', () => {
    const errors = [
      { targetName: 'alertType', text: 'Please select an alert type' },
      { targetName: 'alertSubType', text: 'Please select an alert' },
      { targetNam: 'comment', text: 'Please enter a comment' },
    ]
    const wrapper = shallow(<CreateAlertForm cancelHandler={() => {}} handleSubmit={() => {}} errors={errors} />)

    expect(wrapper).toMatchSnapshot()
  })

  it('should only contain the default drop down values for alerts and alert sub types', () => {
    const wrapper = shallow(<CreateAlertForm cancelHandler={() => {}} handleSubmit={() => {}} />)

    const alertTypeOptions = wrapper.find({ name: 'alertType' }).getElement().props.children
    const alertSubTypeOptions = wrapper.find({ name: 'alertSubType' }).getElement().props.children

    expect(alertTypeOptions.slice(1, alertTypeOptions).length).toBe(0)
    expect(
      alertSubTypeOptions.slice(1, alertSubTypeOptions).reduce((acc, current) => acc.concat(current), []).length
    ).toBe(0)
  })

  it('should populate the alert sub types based off the selected alertType', () => {
    const wrapper = shallow(
      <CreateAlertForm
        cancelHandler={() => {}}
        handleSubmit={() => {}}
        selectedAlertType="alert-type-1"
        alertTypes={alerts.alertTypes}
        alertSubTypes={alerts.alertSubTypes}
      />
    )

    const alertSubTypeOptions = wrapper.find({ name: 'alertSubType' }).getElement().props.children

    expect(alertSubTypeOptions[1][0].props.value).toBe('alert-sub-1')
  })

  it('should show FormattedDate by default', () => {
    const wrapper = shallow(
      <CreateAlertForm cancelHandler={() => {}} handleSubmit={() => {}} effectiveDate="2019-10-10" />
    )

    expect(wrapper.find({ 'data-qa': 'edit-date-link' }).length).toBe(1)
    expect(wrapper.find({ name: 'effectiveDate' }).length).toBe(0)
    expect(wrapper.find('FormattedDate').length).toBe(1)
  })

  it('should hide FormattedDate and show DateInput when the change link is clicked', () => {
    const wrapper = shallow(
      <CreateAlertForm cancelHandler={() => {}} handleSubmit={() => {}} effectiveDate="2019-10-10" />
    )

    clickChangeDateLink(wrapper)

    expect(wrapper.find({ 'data-qa': 'edit-date-link' }).length).toBe(0)
    expect(wrapper.find({ name: 'effectiveDate' }).length).toBe(1)
    expect(wrapper.find('FormattedDate').length).toBe(0)
  })

  it('should enforce date constraints', () => {
    const wrapper = shallow(
      <CreateAlertForm cancelHandler={() => {}} handleSubmit={() => {}} effectiveDate="2019-10-10" />
    )
    clickChangeDateLink(wrapper)

    const { shouldShowDay } = wrapper.find({ name: 'effectiveDate' }).getElement().props

    const today = moment().format(DATE_ONLY_FORMAT_SPEC)
    const sevenDaysAgo = moment()
      .subtract(7, 'day')
      .format(DATE_ONLY_FORMAT_SPEC)

    const tomorrow = moment()
      .add(1, 'day')
      .format(DATE_ONLY_FORMAT_SPEC)

    const eightDaysAgo = moment()
      .subtract(8, 'day')
      .format(DATE_ONLY_FORMAT_SPEC)

    expect(shouldShowDay(today)).toBe(true)
    expect(shouldShowDay(sevenDaysAgo)).toBe(true)

    expect(shouldShowDay(tomorrow)).toBe(false)
    expect(shouldShowDay(eightDaysAgo)).toBe(false)
  })

  it('should call cancel handler when cancel button is clicked', () => {
    const cancelHandler = jest.fn()
    const wrapper = shallow(
      <CreateAlertForm cancelHandler={cancelHandler} handleSubmit={() => {}} effectiveDate="2019-10-10" />
    )

    wrapper.find('ButtonCancel').simulate('click', {})

    expect(cancelHandler).toHaveBeenCalled()
  })

  it('should disable submit button when disableSubmit has been passed in', () => {
    const wrapper = shallow(
      <CreateAlertForm cancelHandler={() => {}} handleSubmit={() => {}} effectiveDate="2019-10-10" disableSubmit />
    )

    expect(wrapper.find({ type: 'submit' }).getElement().props.disabled).toBe(true)
  })
})
