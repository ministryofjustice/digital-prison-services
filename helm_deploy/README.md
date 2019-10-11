
### Example test deploy command

```
helm --namespace digital-prison-services-dev --tiller-namespace digital-prison-services-dev upgrade prison-staff-hub ./prison-staff-hub/ --install --values=values-dev.yaml --values=secrets-example.yaml --dry-run --debug
```

Test template output:

```
helm template ./prison-staff-hub/ --values=values-dev.yaml --values=secrets-example.yaml
```

### Rolling back a release
Find the revision number for the deployment you want to roll back:
```
helm --tiller-namespace digital-prison-services-dev history prison-staff-hub -o yaml
```
(note, each revision has a description which has the app version and circleci build URL)

Rollback
```
helm --tiller-namespace digital-prison-services-dev rollback prison-staff-hub [INSERT REVISION NUMBER HERE] --wait
```

### Helm init

```
helm init --tiller-namespace digital-prison-services-dev --service-account tiller --history-max 200
```

### Setup Lets Encrypt cert

Ensure the certificate definition exists in the cloud-platform-environments repo under the relevant namespaces folder

e.g.
```
cloud-platform-environments/namespaces/live-1.cloud-platform.service.justice.gov.uk/[INSERT NAMESPACE NAME]/05-certificate.yaml
```

### Adding secrets

Ensure the following files are updated:
- helm_deploy/prison-staff-hub/template/secrets.yaml (Do not put cloud platform generated ones in here. Example redis details)
- helm_deploy/prison-staff-hub/template/_envs.tpl
- helm_deploy/prison-staff-hub/secrets-example.yaml

When updating _envs.tpl ensure the name matches the one returned when running kubectl -n NAME_SPACE get secret
