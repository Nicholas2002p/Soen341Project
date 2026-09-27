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
- Nicholas Pouliezos
- Uyen Dinh Michelle Banh
- Yun Chen Qian
- Tyler Johnson
- Abdulla Hareth
- Magley Pierre

## Problems/Bugs

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
4. finaly run 
```bash
   npm run dev
```

## Proposed Features
- Post a job onto the job board
- Look through jobs board
- Filter Jobs base on skills, location, title
- Apply for job
- Manage applications reject or accept applicants
- apply roles to users
- ai resume feature
- more to come!

