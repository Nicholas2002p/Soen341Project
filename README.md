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

