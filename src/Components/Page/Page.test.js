import React from 'react'
import { shallow, mount } from 'enzyme'
import { MemoryRouter } from 'react-router'
import { Page } from './Page'

describe('<Page />', () => {
  const props = {
    title: 'Page title',
    error: '',
    loaded: false,
    children: 'Page content',
    homeLink: 'http://home/',
    defaultHome: 'http://notmhome/',
    backLink: 'http://this/',
  }

  describe('when the page is loading', () => {
    const wrapper = shallow(<Page {...props} />)

    it('should display the loading <Spinner /> component', () => {
      expect(wrapper.find('Spinner').exists()).toBe(true)
    })
  })

  describe('when the page has loaded', () => {
    let wrapper

    beforeEach(() => {
      wrapper = mount(
        <MemoryRouter initialEntries={['/random']}>
          <Page {...props} loaded />
        </MemoryRouter>
      )
    })

    it('should update the document title', () => {
      expect(global.window.document.title).toEqual('Page title - Digital Prison Services')
    })

    it('should display the children prop', () => {
      expect(wrapper.find('.page-content').contains(props.children)).toEqual(true)
    })

    it('should display the Breadcrumb component by default', () => {
      expect(wrapper.find('Breadcrumb').exists()).toEqual(true)
    })

    it('should pass the homelink to Breadcrumb component', () => {
      expect(
        wrapper
          .find('Breadcrumb')
          .find({ homeLink: 'http://home/' })
          .exists()
      ).toEqual(true)
    })

    it('should render a back link if prop passed in', () => {
      expect(
        wrapper
          .find('BackLink')
          .find({ href: 'http://this/' })
          .exists()
      ).toEqual(true)
    })

    it('should NOT display the Breadcrumb component when showBreadcrumb is false', () => {
      wrapper = mount(
        <MemoryRouter initialEntries={['/random']}>
          <Page {...props} loaded showBreadcrumb={false} />
        </MemoryRouter>
      )

      expect(wrapper.find('Breadcrumb').exists()).toEqual(false)
    })

    it('should NOT display the back link component when no backLink prop', () => {
      wrapper = mount(
        <MemoryRouter initialEntries={['/random']}>
          <Page {...props} loaded backLink="" />
        </MemoryRouter>
      )

      expect(wrapper.find('BackLink').exists()).toEqual(false)
    })
  })

  describe('when there is an error', () => {
    const error = 'Error message'

    it('should an error message', () => {
      const wrapper = shallow(<Page {...props} loaded error={error} />)

      expect(wrapper.find('Error').exists()).toBe(true)
      expect(wrapper.find('Error').prop('error')).toEqual(error)
    })

    it('should display an error message and page content if alwaysRender is specified', () => {
      const wrapper = shallow(<Page {...props} loaded error={error} alwaysRender />)

      expect(wrapper.find('Error').exists()).toBe(true)
      expect(wrapper.find('Error').prop('error')).toEqual(error)
      expect(wrapper.find('.page-content').contains(props.children)).toEqual(true)
    })

    it('should display spinner and contents', () => {
      const wrapper = shallow(<Page {...props} alwaysRender loaded={false} />)

      expect(wrapper).toMatchSnapshot()
    })
  })
})
