import React from 'react'
import { shallow } from 'enzyme'
import Error from '.'

describe('Error component', () => {
  it('should render error correctly', async () => {
    const component = shallow(<Error error="Hello!" clearMessage={jest.fn()} />)
    expect(
      component
        .find('div')
        .at(1)
        .text()
    ).toContain('Hello!')
  })

  it('should render error correctly', async () => {
    const component = shallow(
      <Error error={{ message: 'Hello!', showReload: true, reloadPage: jest.fn() }} clearMessage={jest.fn()} />
    )
    expect(
      component
        .find('div')
        .at(1)
        .text()
    ).toContain('Please refresh the page.')
  })
})
