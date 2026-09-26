# Soen341Project


## Database Setup
 1. npm install in root of the project
 2. create an .env in server and make sure to add:
    ```
        DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/JobSeekers"
    ```
 3. open postgreSQL
 4. make sure you create or have a database called `JobSeekers`
5. Run this in the `server` directory:
```bash
   npx prisma migrate dev
```

6. In the same directory, run:
```bash
   npx prisma generate
```
7. make sure to keep postgreSQL open 

## HTTPS Development Server

The server runs over HTTPS when started with `npm run dev` or `npm start`. For local development, install [mkcert](https://github.com/FiloSottile/mkcert), then generate a trusted local certificate:

```bash
mkcert -install
mkdir -p apps/server/certs
mkcert -key-file apps/server/certs/localhost-key.pem -cert-file apps/server/certs/localhost.pem localhost 127.0.0.1 ::1
```

### Windows PowerShell

Open PowerShell as Administrator when installing `mkcert` and its local certificate authority:

```powershell
winget install --id FiloSottile.mkcert -e
mkcert -install
New-Item -ItemType Directory -Force -Path .\apps\server\certs
mkcert -key-file .\apps\server\certs\localhost-key.pem -cert-file .\apps\server\certs\localhost.pem localhost 127.0.0.1 ::1
```

If `winget` is unavailable, install `mkcert` with Chocolatey instead:

```powershell
choco install mkcert
mkcert -install
```

Add these values to `apps/server/.env`:

```env
PORT=3000
TLS_KEY_PATH=certs/localhost-key.pem
TLS_CERT_PATH=certs/localhost.pem
HTTP_REDIRECT_PORT=3001
```

The certificate and private key are local development files and must not be committed. Open the API at `https://localhost:3000`.

