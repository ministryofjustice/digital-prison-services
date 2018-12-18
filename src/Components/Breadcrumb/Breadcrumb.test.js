import React from 'react'
import { shallow } from 'enzyme'
import { Breadcrumb } from './Breadcrumb'

const props = {
  breadcrumbs: [
    {
      key: '/',
      props: {
        match: {
          path: '/',
          url: '/',
          isExact: true,
          params: {},
        },
        location: {
          pathname: '/test-page',
          search: '',
          hash: '',
          key: '8h5b0i',
        },
        children: 'Application homepage',
      },
      type: 'span',
    },
    {
      key: '/test-page',
      props: {
        match: {
          path: '/test-page',
          url: '/test-page',
          isExact: true,
          params: {},
        },
        location: {
          pathname: '/test-page',
          search: '',
          hash: '',
          key: '8h5b0i',
        },
        children: 'Test page',
      },
      type: 'span',
    },
  ],
  match: {
    path: '/test-page',
    url: '/test-page',
    isExact: true,
    params: {},
  },
}

describe('<Breadcrumb />', () => {
  const wrapper = shallow(<Breadcrumb {...props} />)

  it('should display the correct amount of breadcrumbs', () => {
    expect(wrapper.find('Styled(li)').length).toBe(3)
  })

  it('should have the Home link as the first Breadcrumb ', () => {
    expect(
      wrapper
        .find('Styled(li)')
        .first()
        .find('a')
        .text()
    ).toEqual('Home')
  })

  it('should link back to the Application homepage', () => {
    expect(
      wrapper
        .find('Styled(li)')
        .at(1)
        .find('Link')
        .prop('to')
    ).toEqual('/')
    expect(
      wrapper
        .find('Styled(li)')
        .at(1)
        .find('span')
        .text()
    ).toEqual('Application homepage')
  })

  it('should not apply a link to the current page breadcrumb', () => {
    expect(
      wrapper
        .find('Styled(li)')
        .last()
        .find('Link')
        .exists()
    ).toBe(false)
    expect(
      wrapper
        .find('Styled(li)')
        .last()
        .find('span')
        .text()
    ).toEqual('Test page')
  })
})
