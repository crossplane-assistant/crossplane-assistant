{{/* vim: set filetype=mustache: */}}
{{/*
Create api name and version as used by the chart label.
*/}}
{{- define "crossplane-assistant.api.fullname" -}}
{{- printf "%s-%s" (include "crossplane-assistant.fullname" .) .Values.api.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}


{{/*
Create the name of the api service account to use
*/}}
{{- define "crossplane-assistant.api.serviceAccountName" -}}
{{- if .Values.api.serviceAccount.create -}}
    {{ default (include "crossplane-assistant.api.fullname" .) .Values.api.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.api.serviceAccount.name }}
{{- end -}}
{{- end -}}



{{/*
TODO
Create the name of the api service account to use
*/}}
{{- define "crossplane-assistant.api.labels" -}}
{{- end -}}

{{/*
TODO
Create the name of the api service account to use
*/}}
{{- define "crossplane-assistant.api.selectorLabels" -}}
{{- end -}}



{{/*
Create the name of the service account to use
*/}}
{{- define "crossplane-assistant.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "crossplane-assistant.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}


{{/*************************************************************/}}



{{/*
Create api name and version as used by the chart label.
*/}}
{{- define "crossplane-assistant.ui.fullname" -}}
{{- printf "%s-%s" (include "crossplane-assistant.fullname" .) .Values.ui.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}


{{/*
Create the name of the api service account to use
*/}}
{{- define "crossplane-assistant.ui.serviceAccountName" -}}
{{- if .Values.ui.serviceAccount.create -}}
    {{ default (include "crossplane-assistant.ui.fullname" .) .Values.ui.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.ui.serviceAccount.name }}
{{- end -}}
{{- end -}}



{{/*
TODO
Create the name of the api service account to use
*/}}
{{- define "crossplane-assistant.ui.labels" -}}
{{- end -}}

{{/*
TODO
Create the name of the api service account to use
*/}}
{{- define "crossplane-assistant.ui.selectorLabels" -}}
{{- end -}}
