import React from 'react'
import renderer from 'react-test-renderer'
import RadioGroup from '.'

describe('<RadioGroup />', () => {
  const props = {
    label: 'Does this test pass?',
    options: [{ title: 'Yes', value: 'yes' }, { title: 'No', value: 'no' }],
  }

  it('should match the default snapshot', () => {
    const tree = renderer.create(<RadioGroup {...props} />).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it('should match the with hint text snapshot', () => {
    const tree = renderer.create(<RadioGroup {...props} hint="Supporting text to help" />).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it('should match the with meta and error snapshot', () => {
    const tree = renderer.create(<RadioGroup {...props} meta={{ touched: true, error: 'Select an option' }} />).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it('should display image if one is provided', () => {
    const propsImage = {
      label: 'Does this test pass?',
      options: [{ title: 'Yes', value: 'yes', image: 'image.png' }, { title: 'No', value: 'no', image: 'image1.png' }],
    }

    const tree = renderer
      .create(<RadioGroup {...propsImage} meta={{ touched: true, error: 'Select an option' }} />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
