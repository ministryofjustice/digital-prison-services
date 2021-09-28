import React from 'react'
import { shallow } from 'enzyme'
import { Breadcrumb } from './Breadcrumb'

const props = {
  breadcrumbs: [
    {
      breadcrumb: {
        props: {
          children: 'Application homepage',
        },
        type: 'span',
      },
      key: '/',
      location: {
        pathname: '/test-page',
        search: '',
        hash: '',
        key: '8h5b0i',
      },
      match: {
        path: '/',
        url: '/',
        isExact: true,
        params: {},
      },
    },
    {
      breadcrumb: {
        props: {
          children: 'Offender',
          renderDirectly: true,
        },
        type: 'span',
      },
      key: '/offender',
      location: {
        pathname: '/offender',
        search: '',
        hash: '',
        key: '8h5b0i',
      },
      match: {
        path: '/',
        url: '/',
        isExact: true,
        params: {},
      },
    },
    {
      breadcrumb: {
        props: {
          children: 'Test page',
        },
        type: 'span',
      },
      key: '/test-page',
      location: {
        pathname: '/test-page',
        search: '',
        hash: '',
        key: '8h5b0i',
      },
      match: {
        path: '/test-page',
        url: '/test-page',
        isExact: true,
        params: {},
      },
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
    expect(wrapper.find('BreadcrumbItem').length).toBe(3)
  })

  it('should have the Home link as the first Breadcrumb ', () => {
    expect(wrapper.find('BreadcrumbItem').first().find('a').text()).toEqual('Digital Prison Services')
  })

  it('should link to the home', () => {
    expect(wrapper.find('BreadcrumbItem').first().find('a').prop('href')).toEqual('/')
  })

  it('should link back to the Application homepage', () => {
    const breadcrumbItem = wrapper.find('BreadcrumbItem').at(1)

    expect(breadcrumbItem.find('Link').prop('to')).toEqual('/')
    expect(breadcrumbItem.find('span').text()).toEqual('Application homepage')
  })

  it('should always link on the final breadcrumb', () => {
    const breadcrumbItem = wrapper.find('BreadcrumbItem').last()

    expect(breadcrumbItem.find('Link').exists()).toBe(true)
    expect(breadcrumbItem.find('span').text()).toEqual('Offender')
  })
})
