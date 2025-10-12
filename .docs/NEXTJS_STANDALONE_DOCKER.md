```markdown
# Instructions for running the project with Docker (Next.js standalone)

- AUTH_SECRET should be generated using the following command:
  openssl rand -base64 32

- AUTH_URL is used by auth.js. The auth.js documentation states this should be set when it cannot automatically detect the URL of the server where the app is running.
  Example: http://localhost:3000

- AUTH_GITHUB_ID and AUTH_GITHUB_SECRET must be obtained from https://github.com/settings/developers

- PORT is the port the Next.js app will run on. Default is 3000.
```

```bash
DATABASE_URL=
AUTH_SECRET=
AUTH_TRUST_HOST=true
AUTH_URL=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
AUTH_MICROSOFT_ENTRA_ID_ID=
AUTH_MICROSOFT_ENTRA_ID_SECRET=
AUTH_MICROSOFT_ENTRA_ID_ISSUER=https://login.microsoftonline.com/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/v2.0
PORT=
```
