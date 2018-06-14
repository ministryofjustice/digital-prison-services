import "babel-jest";
import React from 'react';
import ReactDOM from 'react-dom';
jest.mock('./Spinner/index', () => '');
import App from './App';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

describe('App component', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    // Just provide dummy required prop functions
    const fn = jest.fn();
    ReactDOM.render(<App
      configDispatch={fn}
      userDetailsDispatch={fn}
      switchAgencyDispatch={fn}
      setTermsVisibilityDispatch={fn}
      setErrorDispatch={fn}
      setMessageDispatch={fn}
      locationDispatch={fn}
      activitiesDispatch={fn}
      activityDispatch={fn}
      dateDispatch={fn}
      periodDispatch={fn}
      houseblockDataDispatch={fn}
      setLoadedDispatch={fn}
      orderDispatch={fn}
    />, div);
    ReactDOM.unmountComponentAtNode(div);
  });


  it('should handle session timeout error response and display alert', async () => {
    const fn = jest.fn();
    const component = shallow(<App
      configDispatch={fn}
      userDetailsDispatch={fn}
      switchAgencyDispatch={fn}
      setTermsVisibilityDispatch={fn}
      setErrorDispatch={fn}
      setMessageDispatch={fn}
      locationDispatch={fn}
      activitiesDispatch={fn}
      activityDispatch={fn}
      dateDispatch={fn}
      periodDispatch={fn}
      houseblockDataDispatch={fn}
      setLoadedDispatch={fn}
      orderDispatch={fn}
    />);
    const appInstance = component.instance();
    appInstance.displayAlertAndLogout = jest.fn();
    appInstance.handleError({ response: { status: 401, data: { message: "Session expired" } } });
    expect(component.instance().displayAlertAndLogout).toBeCalledWith('Your session has expired, please click OK to be redirected back to the login page');

    appInstance.displayAlertAndLogout = jest.fn();
    appInstance.handleError({ response: { status: 401, data: { message: "another 401" } } });
    expect(component.instance().displayAlertAndLogout).not.toBeCalled();

    appInstance.displayAlertAndLogout = jest.fn();
    appInstance.handleError({ response: { status: 400 } });
    expect(component.instance().displayAlertAndLogout).not.toBeCalled();

    appInstance.displayAlertAndLogout = jest.fn();
    appInstance.handleError({});
    expect(component.instance().displayAlertAndLogout).not.toBeCalled();
  });

  it('should handle non-session timout error responses without the session timeout alert', async () => {
    const fn = jest.fn();
    const component = shallow(<App
      configDispatch={fn}
      userDetailsDispatch={fn}
      switchAgencyDispatch={fn}
      setTermsVisibilityDispatch={fn}
      setErrorDispatch={fn}
      setMessageDispatch={fn}
      locationDispatch={fn}
      activitiesDispatch={fn}
      activityDispatch={fn}
      dateDispatch={fn}
      periodDispatch={fn}
      houseblockDataDispatch={fn}
      setLoadedDispatch={fn}
      orderDispatch={fn}
      sortOrderDispatch={fn}
    />);
    const appInstance = component.instance();
    appInstance.displayAlertAndLogout = jest.fn();
    appInstance.handleError({ response: { status: 401, data: { message: "another 401" } } });
    expect(component.instance().displayAlertAndLogout).not.toBeCalled();

    appInstance.displayAlertAndLogout = jest.fn();
    appInstance.handleError({ response: { status: 400 } });
    expect(component.instance().displayAlertAndLogout).not.toBeCalled();

    appInstance.displayAlertAndLogout = jest.fn();
    appInstance.handleError({});
    expect(component.instance().displayAlertAndLogout).not.toBeCalled();
  });
});
