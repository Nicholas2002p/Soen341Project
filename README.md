# CareerConnect Soen341Project

## Description
CareerConnect is a website that allows users to find jobs and recruiters to find employees easier.

### Features implemented
- login and register
- view and update your profile
- view dummy job postings in home

### Features almost done implementing
- resume upload and display
- google login


## Team Members
- Nicholas Pouliezos 40337451
- Uyen Dinh Michelle Banh 40334488
- Yun Chen Qian 40337539
- Tyler Johnson 40299090
- Abdulla Hareth 402121538
- Magley Pierre 40210677

## Problems/Bugs
- no bugs so far

## Technologies
   ### Frontend
   - Vite React
   - SCSS
   ### Server
   - typescript
   - express + node.js
   ### database
   - postgreSQL
   - prisma ORM
   - bcrypt
   ### test
   - node Test

## Setup Instructions
### Database Setup
 1. ```bash
       npm install
    ```          
in root of the project
 2. create an .env in server and make sure to add:
    ```
      DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/JobSeekers"
    ```
 3. open postgreSQL
 4. make sure you create or have a database called `JobSeekers`
 5. keep the owner as postgres
6. Run this in the `server` directory:
```bash
   npx prisma migrate dev
```

7. In the same directory, run:
```bash
   npx prisma generate
```

### FrontEnd  and server setup
1. in server run 
```bash
       npm install
    ```
2.  in root of the project run 
```bash
       npm install
    ```
3. then run 
```bash
   npm build
```
4. finally run 
```bash
   npm run dev
```

### Client Environment Setup
Create `apps/client/.env.local` from `apps/client/.env.example` and set the API target:

```env
VITE_API_URL=https://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

The client uses `VITE_API_URL` for all server requests. Restart the Vite client after changing environment variables.

## Proposed Features
- Post a job onto the job board
- Look through jobs board
- Filter Jobs base on skills, location, title
- Apply for job
- Manage applications reject or accept applicants
- apply roles to users
- ai resume feature
- more to come!

## Google Sign-In Setup
Google sign-in needs a Google OAuth Client ID on both the server and the client.

**Option 1 (easiest):** ask the team on Discord for the shared Client ID.

**Option 2: create your own**
1. Go to [Google Cloud Console](https://console.cloud.google.com/) and create a project
2. Go to **APIs & Services → OAuth consent screen** and configure it (External, add your email as a test user)
3. Go to **APIs & Services → Credentials → Create credentials → OAuth client ID**
4. Choose **Web application**
5. Under **Authorized JavaScript origins**, add `http://localhost:5173`
6. Copy the generated **Client ID**

**Then add the same Client ID to both env files:**
- `apps/server/.env` → `GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com`
- `apps/client/.env.local` → `VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com`

Restart both servers after editing the env files.
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

