import "babel-jest";
import React from 'react';
import ReactDOM from 'react-dom';
jest.mock('./Spinner/index', () => '');
import App from './App';

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
