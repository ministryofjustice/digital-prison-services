import React from 'react'
import TestRenderer, { act } from 'react-test-renderer'
import Paragraph from '@govuk-react/paragraph'
import ButtonCancel from '../ButtonCancel'
import PayDetails from '.'

describe('<PayDetails />', () => {
  const props = {
    paid: false,
    absentReason: 'AcceptableAbsence',
    comments: 'Some test comments or case note text.',
    cancelHandler: jest.fn(),
  }

  const testRenderer = TestRenderer.create(<PayDetails {...props} />)
  const testInstance = testRenderer.root
  const paragraphs = testInstance.findAllByType(Paragraph)

  it('should display the correct information if an offender has not been paid', () => {
    expect(paragraphs[0].props.children).toEqual('Not paid')
  })

  it('should display the correct information if an offender has been paid', () => {
    props.paid = true
    act(() => testRenderer.update(<PayDetails {...props} />))
    expect(paragraphs[0].props.children).toEqual('Paid')
  })

  it('should display the correct information', () => {
    expect(paragraphs[1].props.children).toEqual('Acceptable absence')
    expect(paragraphs[2].props.children).toEqual(props.comments)
  })

  it('should call cancelHandler when cancel button is clicked', () => {
    const cancelButton = testInstance.findByType(ButtonCancel)
    cancelButton.props.onClick()
    expect(props.cancelHandler).toHaveBeenCalled()
  })
})
