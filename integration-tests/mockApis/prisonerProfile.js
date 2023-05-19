const { stubFor } = require('./wiremock')

const stubPrisonerProfile = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prisonerprofile/prisoner/.+?',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        Location: 'http://localhost:9191/prisonerprofile/prisoner//.+?',
      },
      body: '<html><body><h1>New Prisoner Profile!</h1><h2>Overview</h2></body></html>',
    },
  })

const stubPrisonerProfilePersonal = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prisonerprofile/prisoner/.+?/personal',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
      body: '<html><body><h1>New Prisoner Profile!</h2><h2>Personal</h2></body></html>',
    },
  })

const stubPrisonerProfileCaseNotes = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prisonerprofile/prisoner/.+?/case-notes',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
      body: '<html><body><h1>New Prisoner Profile!</h2><h2>Case notes</h2></body></html>',
    },
  })

const stubPrisonerProfileAlerts = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prisonerprofile/prisoner/.+?/alerts',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
      body: '<html><body><h1>New Prisoner Profile!</h2><h2>Alerts</h2></body></html>',
    },
  })

const stubPrisonerProfileOffences = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prisonerprofile/prisoner/.+?/offences',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
      body: '<html><body><h1>New Prisoner Profile!</h2><h2>Offences</h2></body></html>',
    },
  })

const stubPrisonerProfileWorkAndSkills = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prisonerprofile/prisoner/.+?/work-and-skills',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
      body: '<html><body><h1>New Prisoner Profile!</h2><h2>Work and skills</h2></body></html>',
    },
  })

module.exports = {
  stubPrisonerProfile,
  stubPrisonerProfilePersonal,
  stubPrisonerProfileCaseNotes,
  stubPrisonerProfileAlerts,
  stubPrisonerProfileOffences,
  stubPrisonerProfileWorkAndSkills,
}
