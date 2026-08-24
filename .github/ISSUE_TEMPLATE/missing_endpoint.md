---
name: Missing or wrong endpoint
about: An API operation has no method, or a method sends the wrong thing
labels: coverage
---

**Operation**

Method and path, for example `POST /v1/transactions/bulk`.

**What the SDK does today**

Missing entirely, or sends the wrong parameters. If the latter, paste the
request the SDK produced and the request the API expects.

**How you confirmed it**

A live call, the OpenAPI spec, or the published docs.
