{{/* vim: set filetype=mustache: */}}
{{/*
Environment variables for web and worker containers
*/}}
{{- define "deployment.envs" }}
env:
  - name: API_CLIENT_ID
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: API_CLIENT_ID

  - name: API_CLIENT_SECRET
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: API_CLIENT_SECRET

  - name: API_SYSTEM_CLIENT_ID
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: API_SYSTEM_CLIENT_ID

  - name: API_SYSTEM_CLIENT_SECRET
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: API_SYSTEM_CLIENT_SECRET

  - name: APPINSIGHTS_INSTRUMENTATIONKEY
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: APPINSIGHTS_INSTRUMENTATIONKEY

  - name: CONTENTFUL_SPACE_ID
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: CONTENTFUL_SPACE_ID

  - name: CONTENTFUL_ACCESS_TOKEN
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: CONTENTFUL_ACCESS_TOKEN

  - name: GOOGLE_ANALYTICS_ID
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: GOOGLE_ANALYTICS_ID

  - name: GOOGLE_TAG_MANAGER_ID
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: GOOGLE_TAG_MANAGER_ID

  - name: SESSION_COOKIE_SECRET
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: SESSION_COOKIE_SECRET

  - name: NOTIFY_API_KEY
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: NOTIFY_API_KEY

  - name: WANDSWORTH_OMU_EMAIL
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: WANDSWORTH_OMU_EMAIL

  - name: THAMESIDE_OMU_EMAIL
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: THAMESIDE_OMU_EMAIL
    
  - name: HEWELL_OMU_EMAIL
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: HEWELL_OMU_EMAIL

  - name: BERWYN_OMU_EMAIL
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: BERWYN_OMU_EMAIL
    
  - name: ELMLEY_OMU_EMAIL
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: ELMLEY_OMU_EMAIL

  - name: NOTTINGHAM_OMU_EMAIL
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: NOTTINGHAM_OMU_EMAIL

  - name: BULLINGDON_OMU_EMAIL
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: BULLINGDON_OMU_EMAIL
        
  - name: REDIS_HOST
    valueFrom:
      secretKeyRef:
        name: dps-redis
        key: REDIS_HOST

  - name: REDIS_PASSWORD
    valueFrom:
      secretKeyRef:
        name: dps-redis
        key: REDIS_PASSWORD

  - name: API_ENDPOINT_URL
    value: {{ .Values.env.API_ENDPOINT_URL | quote }}

  - name: OAUTH_ENDPOINT_URL
    value: {{ .Values.env.OAUTH_ENDPOINT_URL | quote }}

  - name: CASENOTES_API_URL
    value: {{ .Values.env.CASENOTES_API_URL | quote }}

  - name: PRISON_STAFF_HUB_UI_URL
    value: "https://{{ .Values.ingress.host }}/"

  - name: API_WHEREABOUTS_ENDPOINT_URL
    value: {{ .Values.env.API_WHEREABOUTS_ENDPOINT_URL | quote }}

  {{- if .Values.env.SYSTEM_PHASE }}
  - name: SYSTEM_PHASE
    value: {{ .Values.env.SYSTEM_PHASE | quote }}
  {{- end }}

  {{- if .Values.env.API_DATA_COMPLIANCE_ENDPOINT_URL }}
  - name: API_DATA_COMPLIANCE_ENDPOINT_URL
    value: {{ .Values.env.API_DATA_COMPLIANCE_ENDPOINT_URL | quote }}
  {{- end }}

  {{- if .Values.env.DISPLAY_RETENTION_LINK }}
  - name: DISPLAY_RETENTION_LINK
    value: {{ .Values.env.DISPLAY_RETENTION_LINK | quote }}
  {{- end }}

  - name: UPDATE_ATTENDANCE_PRISONS
    value: {{ .Values.env.UPDATE_ATTENDANCE_PRISONS | quote }}

  - name: LICENCES_URL
    value: {{ .Values.env.LICENCES_URL | quote }}

  - name: REMOTE_AUTH_STRATEGY
    value: {{ .Values.env.REMOTE_AUTH_STRATEGY | quote }}

  - name: WEB_SESSION_TIMEOUT_IN_MINUTES
    value: {{ .Values.env.WEB_SESSION_TIMEOUT_IN_MINUTES | quote }}

  - name: API_COMMUNITY_ENDPOINT_URL
    value: {{ .Values.env.API_COMMUNITY_ENDPOINT_URL | quote }}

  - name: API_COMMUNITY_API_PREFIX
    value: {{ .Values.env.API_COMMUNITY_API_PREFIX | quote }}

  - name: HMPPS_COOKIE_NAME
    value: {{ .Values.env.HMPPS_COOKIE_NAME | quote }}

  - name: HMPPS_COOKIE_DOMAIN
    value: {{ .Values.ingress.host | quote }}

  - name: KEYWORKER_API_URL
    value: {{ .Values.env.KEYWORKER_API_URL | quote }}

  - name: CATEGORISATION_UI_URL
    value: {{ .Values.env.CATEGORISATION_UI_URL | quote }}

  - name: USE_OF_FORCE_URL
    value: {{ .Values.env.USE_OF_FORCE_URL | quote }}

  - name: USE_OF_FORCE_PRISONS
    value: {{ .Values.env.USE_OF_FORCE_PRISONS | quote }}

  - name: TOKENVERIFICATION_API_URL
    value: {{ .Values.env.TOKENVERIFICATION_API_URL | quote }}

  - name: TOKENVERIFICATION_API_ENABLED
    value: {{ .Values.env.TOKENVERIFICATION_API_ENABLED | quote }}

  - name: OFFENDER_SEARCH_API_URL
    value: {{ .Values.env.OFFENDER_SEARCH_API_URL | quote }}

  - name: ALLOCATION_MANAGER_ENDPOINT_URL
    value: {{ .Values.env.ALLOCATION_MANAGER_ENDPOINT_URL | quote }}

  - name: SUPPORT_URL
    value: {{ .Values.env.SUPPORT_URL | quote }}

  - name: COMPLEXITY_OF_NEED_URI
    value: {{ .Values.env.COMPLEXITY_OF_NEED_URI | quote }}

  - name: NODE_ENV
    value: production

  - name: REDIS_ENABLED
    value: {{ .Values.env.REDIS_ENABLED | quote }}

  - name: PATHFINDER_UI_URL
    value: {{ .Values.env.PATHFINDER_UI_URL | quote }}

  - name: PATHFINDER_ENDPOINT_API_URL
    value: {{ .Values.env.PATHFINDER_ENDPOINT_API_URL | quote }}

  - name: PIN_PHONES_URL
    value: {{ .Values.env.PIN_PHONES_URL | quote }}

  - name: SOC_UI_URL
    value: {{ .Values.env.SOC_UI_URL | quote }}

  - name: SOC_API_URL
    value: {{ .Values.env.SOC_API_URL | quote }}

  - name: SOC_API_ENABLED
    value: {{ .Values.env.SOC_API_ENABLED | quote }}

  - name: CURIOUS_URL
    value: {{ .Values.env.CURIOUS_URL | quote }}

  - name: ESWE_ENABLED
    value: {{ .Values.env.ESWE_ENABLED | quote }}

  - name: BVL_URL
    value: {{ .Values.env.BVL_URL | quote }}

  - name: MOIC_URL
    value: {{ .Values.env.MOIC_URL | quote }}

  - name: MANAGE_AUTH_ACCOUNTS_URL
    value: {{ .Values.env.MANAGE_AUTH_ACCOUNTS_URL | quote }}
    
  - name: PECS_URL
    value: {{ .Values.env.PECS_URL | quote }}

  - name: OMIC_URL
    value: {{ .Values.env.OMIC_URL | quote }}

  - name: PRISONS_WITH_OFFENDERS_THAT_HAVE_COMPLEX_NEEDS
    value: {{ .Values.env.PRISONS_WITH_OFFENDERS_THAT_HAVE_COMPLEX_NEEDS | quote }}
    
{{- end -}}
