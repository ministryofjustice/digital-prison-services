import React from 'react'
import { mount } from 'enzyme'
import ModalProvider from './index'

describe('ModalProvider', () => {
  const store = {
    getState: () => {},
    subscribe: () => {},
    dispatch: () => {},
  }

  const Com1 = () => <div>Com1</div>
  const Com2 = () => <div>Com2</div>

  it('should not render the modal when the modal identifier is undefined', () => {
    const provider = mount(<ModalProvider store={store} showModal={{}} />)

    expect(provider.contains(<div />)).toBe(true)
  })

  it('should not render the modal when the child does not match the identifier past in', () => {
    const showModal = {
      identifier: 'com2',
    }
    const provider = mount(
      <ModalProvider showModal={showModal} store={store}>
        <Com1 className="com1" key="com1" />
      </ModalProvider>
    )

    expect(provider.find('.com1').length).toBe(0)
  })

  it('should not render the model when none of the children match the identifier', () => {
    const showModal = {
      identifier: 'com3',
    }
    const provider = mount(
      <ModalProvider showModal={showModal} store={store}>
        <Com2 className="com2" key="com2" />
        <Com1 className="com1" key="com1" />
      </ModalProvider>
    )

    expect(provider.find('.com2').length).toBe(0)
    expect(provider.find('.com1').length).toBe(0)
  })

  it('should render the modal when the child matches the identifier', () => {
    const showModal = {
      identifier: 'com1',
    }
    const provider = mount(
      <ModalProvider showModal={showModal} store={store}>
        <Com1 className="com1" key="com1" />
      </ModalProvider>
    )

    expect(provider.find('.com1').length).toBe(1)
  })

  it('should render the modal when the identifier matches one of the children', () => {
    const showModal = {
      identifier: 'com1',
    }
    const provider = mount(
      <ModalProvider showModal={showModal} store={store}>
        <Com2 className="com2" key="com2" />
        <Com1 className="com1" key="com1" />
      </ModalProvider>
    )

    expect(provider.find('.com2').length).toBe(0)
    expect(provider.find('.com1').length).toBe(1)
  })
})
