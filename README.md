# Prison Staff Hub UI App

Application can be built with for dev mode

```bash
npm install
npm run compile-sass
npm run start:dev
```

The application will automatically pick up front end changes and it will restart if there are any changes in /backend or /views.
Other changes will require a manual restart.

Run locally as docker

```bash
docker run -p 3000:3000 -d \
     --name digital-prison-services \
     quay.io/hmpps/digital-prison-services:latest
```

Run remotely as docker

```bash
docker run -p 3000:3000 -d \
     --name digital-prison-services \
     -e API_ENDPOINT_URL=https://prison-api-dev.prison.service.justice.gov.uk/ \
     -e OAUTH_ENDPOINT_URL=https://sign-in-dev.hmpps.service.justice.gov.uk/auth/ \
     -e API_GATEWAY_TOKEN=<add here> \
     -e API_CLIENT_SECRET=<add here> \
     -e API_GATEWAY_PRIVATE_KEY=<add here> \
     quay.io/hmpps/digital-prison-services:latest
```

## Cypress integration tests

The `integration-tests` directory contains a set of Cypress integration tests for the `digital-prison-services` application.
These tests use WireMock to stub the application's dependencies on the prisonApi, oauth and whereabouts RESTful APIs.

### Running the Cypress tests

You need to fire up the wiremock server first:
```docker compose -f docker-compose-test.yaml up```

This will give you useful feedback if the app is making requests that you haven't mocked out. You can see
the request log at `localhost:9191/__admin/requests` and a JSON representation of the mocks `localhost:9191/__admin/mappings`.

### Starting feature tests node instance

A separate node instance needs to be started for the feature tests. This will run on port 3008 and won't conflict
with any of the api services, e.g. prisonApi or oauth. It will also not conflict with the Groovy integration tests.

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

### Useful links

- WireMock: http://wiremock.org/
- Chromedriver: https://sites.google.com/a/chromium.org/chromedriver

### Feature toggles
- **SOC API:**
This will enable/disable to ability to refer a prisoner to the SOC service and view their SOC profile if already referred.
To enable the feature, change the environment variable of **SOC_API_ENABLED** to **true**. Any other value will disable the feature. 
- **Neurodivergence accelerated prisons:**
To restrict access to neurodivergence information to nominated prisons only. This is a temporary measure agreed with stakeholders and to allow third party curiousApi provider time to rethink their API connections threshold. To enable the feature, add prison codes to the environment variable **NEURODIVERSITY_ENABLED_PRISONS**. For example, to allow access to only Moorland and Bristol: **NEURODIVERSITY_ENABLED_PRISONS**=**MDI,BLI**  If left blank then *all* prisons will have access to the neurodivergence information.

#### Phase Name Banner
To show the phase name banner add the environment variable ``` SYSTEM_PHASE=ENV_NAME ```. 
This will trigger the banner to become visible showing the given name.

### Regenerating API typescript types

The types files for apis can be regenerated by first a command like this example for the Curious api:

`npx openapi-typescript https://testservices.sequation.net/sequation-virtual-campus2-api/v3/api-docs --output backend/api/curious/types/index.d.ts`

.. then formatting using prettier and reincorporating the local changes such as the enums and invalid type names.
