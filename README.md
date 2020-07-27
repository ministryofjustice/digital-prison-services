# Prison Staff Hub UI App

Application can be built with for dev mode

```bash
npm
npm start:dev
```

The application will automatically pick up front end changes and it will restart if there are any changes in /backend or /views.
Other changes will require a manual restart.

For production

```bash
npm build
node-env mode=PRODUCTION npm start
```

Run locally as docker

```bash
docker run -p 3000:3000 -d \
     --name prisonstaffhub \
     mojdigitalstudio/prisonstaffhub:latest
```

Run remotely as docker

```bash
docker run -p 3000:3000 -d \
     --name prisonstaffhub \
     -e API_ENDPOINT_URL=https://api-dev.prison.service.justice.gov.uk/ \
     -e OAUTH_ENDPOINT_URL=https://sign-in-dev.hmpps.service.justice.gov.uk/auth/ \
     -e API_GATEWAY_TOKEN=<add here> \
     -e API_CLIENT_SECRET=<add here> \
     -e API_GATEWAY_PRIVATE_KEY=<add here> \
     mojdigitalstudio/prisonstaffhub:latest
```

## Cypress integration tests

The `integration-tests` directory contains a set of Cypress integration tests for the `prisonstaffhub` application.
These tests use WireMock to stub the application's dependencies on the elite2, oauth and whereabouts RESTful APIs.

### Running the Cypress tests

You need to fire up the wiremock server first:
```docker-compose -f docker-compose-test.yaml up```

This will give you useful feedback if the app is making requests that you haven't mocked out. You can see
the request log at `localhost:9191/__admin/requests/` and a JSON representation of the mocks `localhost:9191/__admin/mappings`.

### Starting feature tests node instance

A separate node instance needs to be started for the feature tests. This will run on port 3008 and won't conflict
with any of the api services, e.g. elite2-api or oauth. It will also not conflict with the Groovy integration tests.

```npm run start-feature --env=cypress.env```

Note that the circleci will run `start-feature-no-webpack` instead, which will rely on a production webpack build
rather than using the dev webpack against the assets.

### Running the tests

With the UI:
```
npm run int-test-ui
```

Just on the command line (any console log outputs will not be visible, they appear in the browser the Cypress UI fires up):
```
npm run int-test
```

## Groovy integration tests

The `prisonstaffhub-specs` directory contains a set of Groovy integration tests for the `prisonstaffhub` application.
These tests are written in the Groovy programming language using a test framework called Spock. The tests drive
the UI using 'Geb', a Groovy wrapper for Selenium Webdriver, and use WireMock to stub the application's dependencies
on the elite2 and keyworker-service RESTful APIs.

### Running the Groovy tests

The tests may be run from an IDE such as IntelliJ IDEA or from the Gradle build.
The tests may be configured to drive a range of web-browsers including Chrome headless and PhantomJS.
Currently the tests use Chrome and / or Chrome headless.
To drive the tests through Chrome you must install Chrome (obviously) and a Selenium Webdriver adapter called ChromeDriver.
ChromeDriver is a standalone server which implements WebDriver's wire protocol for
Chromium. Download the latest version of ChromeDriver from here:
https://sites.google.com/a/chromium.org/chromedriver/downloads and follow the installation instructions here:
https://sites.google.com/a/chromium.org/chromedriver/getting-started

### Starting feature tests node instance

A separate node instance needs to be started for the feature tests. This will run on port 3006 and won't conflict
with any of the api services, e.g. elite2-api or oauth.

```npm start-feature --env=feature.env```

**To run the tests using Gradle:**
Ensure that chromedriver is on your path. Run `./gradlew build` from the root of this project.
The Gradle build will produce report(s) at `prisonstaffhub-specs/reports/tests`

**To run the tests from IntelliJ IDEA:**
Ensure that `build.gradle` is linked to the IDE project (See here: https://www.jetbrains.com/help/idea/gradle.html)
and that `chromedriver` is on the PATH. Open a Spock Specification
(`uk.gov.justice.digital.hmpps.prisonstaffhub.specs.LoginSpecification` for example). The gutter should
now display 'run' icons for the class and each of its tests methods.

### Useful links

- Spock: http://spockframework.org/
- Geb: http://www.gebish.org/
- Groovy: http://groovy-lang.org/index.html
- Gradle: https://gradle.org/
- WireMock: http://wiremock.org/
- Chromedriver: https://sites.google.com/a/chromium.org/chromedriver

## Feature toggles
- **SOC API:**
This will enable/disable to ability to refer a prisoner to the SOC service and view their SOC profile if already referred.
To enable the feature, change the environment variable of **SOC_API_ENABLED** to **true**. Any other value will disable the feature. 

