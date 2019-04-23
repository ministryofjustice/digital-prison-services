# Prison Staff Hub UI App

Application can be built with for dev mode

```bash
yarn
yarn start
```

The application will automatically pick up front end changes, but you will need to restart the app to pick up any
changes within the backend folder.

For production

```bash
yarn build
node-env mode=PRODUCTION yarn start
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
     -e API_ENDPOINT_URL=https://noms-api-dev.dsd.io/elite2api/ \
     -e API_GATEWAY_TOKEN=<add here> \
     -e API_CLIENT_SECRET=<add here> \
     -e API_GATEWAY_PRIVATE_KEY=<add here> \
     mojdigitalstudio/prisonstaffhub:latest
```

## Integration tests

The `prisonstaffhub-specs` directory contains a set of integration tests for the `prisonstaffhub` application.
These tests are written in the Groovy programming language using a test framework called Spock. The tests drive
the UI using 'Geb', a Groovy wrapper for Selenium Webdriver, and use WireMock to stub the application's dependencies
on the elite2 and keyworker-service RESTful APIs.

### Running the tests

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

`yarn start-feature`

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
