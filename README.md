# CareerConnect Soen341Project

## Discription
CareerConnect is a website that allows users to find jobs  and recruters to find employes easier.
Right now 


## Team Members
- Nicholas Pouliezos
- Uyen Dinh Michelle Banh
- Yun Chen Qian
- Tyler Johnson
- Abdulla Hareth
- Magley Pierre

## Problems

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
   - junit

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

6. In the same directory, run:
```bash
   npx prisma generate
```
7. make sure to keep postgreSQL open 

### FrontEnd  and server setup
1. make sure you are back at the root of the project if u already npm install
 then run
```bash
   npm build
```
2. then run 
```bash
   npm run dev
```

## Proposed Features
- Post a job onto the job board
- Look throught jobs
- Filter Jobs
- Apply for job
- Manage applications
- 
- 
- 
- 
- 

