# Norway in Orbit

Unzip into the repository root on the main branch. Include .github/workflows/groundtrack.yml and select Settings → Pages → Source → GitHub Actions. The Publish ground track workflow runs on upload, on manual request and hourly. Each run retrieves available CelesTrak elements and retains the newest available epoch per satellite from the previous publication and bundled data.

Open displays check the published orbit-data.json at startup and hourly after successful checks. Failed downloads retry after five minutes while the display continues using its existing elements. All times are UTC.
