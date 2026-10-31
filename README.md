# IT Job Recruitment Platform - Backend

An Express and TypeScript API for an IT recruitment platform. Candidates can browse jobs and submit CVs; employers can manage their company profile, publish jobs and review applications.

**[Frontend demo](https://it-job-frontend.onrender.com)** · **[Frontend repository](https://github.com/HungTrinh30106/it-job-frontend)** · **[Public API example](https://it-job-backend-wmk5.onrender.com/company/list?limitItem=2&page=1)**

API base URL: `https://it-job-backend-wmk5.onrender.com`

The API root is not a website home page. Use a documented endpoint such as `/company/list` to inspect a response.

## Features

- Separate candidate and employer accounts with bcrypt password hashing and JWT authentication in HttpOnly cookies.
- Middleware that verifies the token, account type and existing account.
- Employer profile updates and job CRUD with ownership checks.
- Public company/job details and search by technology, city, company, keyword, position and working form.
- Database-side pagination, sorting and record counts.
- CV uploads, candidate application history and employer application review.
- Viewed flags and `initial`, `approved`, `rejected` application states.
- Joi request-body validation and multipart uploads through Multer and Cloudinary.
- Configurable frontend origin, port and environment-dependent cookie settings.

## Technology and architecture

Node.js, Express 5, TypeScript, MongoDB, Mongoose, Joi, bcryptjs, jsonwebtoken, cookie-parser, CORS, Multer and Cloudinary.

```text
index.ts          Application setup, CORS, parsers and server startup
routes/           URLs, methods and middleware ordering
middlewares/      Candidate/employer authentication
controllers/      Business logic, database queries and JSON responses
models/           Mongoose schemas and collection mappings
validates/        Joi request validation
helpers/          Cloudinary storage configuration
interfaces/       Request type containing the authenticated account
configs/          Database connection
```

Controllers contain the business logic and database queries directly. Related records are joined using Mongoose queries in application code; the current implementation does not use `populate` or aggregation pipelines.

## Run locally

### Requirements

- A recent Node.js release compatible with the dependencies; the Render deployment uses Node.js 24.
- Yarn Classic 1.x.
- MongoDB locally or a MongoDB Atlas connection with access permitted for your environment.
- A Cloudinary account for image and CV uploads.

```bash
git clone https://github.com/HungTrinh30106/it-job-backend.git
cd it-job-backend
yarn install --frozen-lockfile --production=false
```

Create `.env` in the repository root:

```dotenv
PORT=4000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:3000
DATABASE=mongodb://127.0.0.1:27017/it_job
JWT_SECRET_KEY=replace-with-a-long-random-secret
CLOUDINARY_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

These values are examples; supply your own credentials and keep `.env` out of Git.

```bash
yarn dev
```

The API listens on [http://localhost:4000](http://localhost:4000). Run the frontend on `http://localhost:3000` using the same hostname.

### Initial data

The GitHub repository does not include a database dump or a seed command. Register candidate/employer accounts through the frontend. Populate the `city-list` collection with city records such as `{ "name": "Hà Nội" }` to use city selection, then complete an employer profile and create jobs. With a fresh database, public lists can be empty.

### Scripts

| Command | Purpose |
| --- | --- |
| `yarn dev` | Nodemon and ts-node development server |
| `yarn build` | Compile TypeScript into `dist/` |
| `yarn start` | Run `node dist/index.js` |

Run `yarn build` before `yarn start`. Development dependencies, including TypeScript, are required during the build.

## Data model

| Collection | Main purpose and relationships |
| --- | --- |
| `accounts-user` | Candidate identity, email, password hash and profile |
| `accounts-company` | Employer identity, company information and city ID |
| `jobs` | Job content, salary range, technologies, images and `companyId` |
| `cvs` | Applicant details, `jobId`, uploaded file URL, viewed flag and status |
| `city-list` | City names |

Company-to-job and job-to-CV relationships are stored as string IDs. Candidate-to-CV association currently uses email, not `userId`. Uploaded file contents are stored on Cloudinary; MongoDB stores their URLs.

## API reference

`Public` endpoints do not require login. `Candidate` and `Employer` endpoints require the matching JWT account type. Employer job/CV operations also check ownership.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/user/register` | Public | Register candidate |
| POST | `/user/login` | Public | Log in candidate |
| PATCH | `/user/profile` | Candidate | Update profile; optional `avatar` file |
| GET | `/user/cv/list` | Candidate | Application history, `page` query |
| GET | `/user/cv/detail/:id` | Candidate | Application details |
| DELETE | `/user/cv/delete/:id` | Candidate | Delete own application |
| POST | `/company/register` | Public | Register employer |
| POST | `/company/login` | Public | Log in employer |
| PATCH | `/company/profile` | Employer | Update company; optional `logo` file |
| POST | `/company/job/create` | Employer | Create job; up to 3 `images` |
| GET | `/company/job/list` | Employer | Own jobs, `page` query |
| GET | `/company/job/detail/:id` | Employer | Own job details |
| PATCH | `/company/job/edit/:id` | Employer | Edit own job |
| DELETE | `/company/job/delete/:id` | Employer | Delete own job |
| GET | `/company/list` | Public | Companies; `page`, `limitItem` queries |
| GET | `/company/detail/:id` | Public | Company details and jobs |
| GET | `/company/cv/list` | Employer | Received applications, `page` query |
| GET | `/company/cv/detail/:id` | Employer | Application details; marks viewed |
| PATCH | `/company/cv/change-status/:id` | Employer | Set `initial`, `approved` or `rejected` |
| DELETE | `/company/cv/delete/:id` | Employer | Delete an application to own job |
| GET | `/job/detail/:id` | Public | Job and associated company details |
| POST | `/job/apply` | Public | Submit applicant fields and `fileCV` |
| GET | `/city/list` | Public | City directory |
| GET | `/search` | Public | Filtered jobs and pagination |
| GET | `/auth/check` | Reads JWT cookie | Current candidate/employer information |
| GET | `/auth/logout` | Public | Clear login cookie |

### Search

Accepted query parameters are `language`, `city`, `company`, `keyword`, `position`, `workingForm` and `page`.

Example request:

```text
GET /search?language=ReactJS&position=intern&page=1
```

Search without any query parameters currently returns an empty result. Company listings use `limitItem` (singular), not `limitItems`.

### Responses and uploads

Responses generally use `{ "code": "success" | "error", "message": "...", ...data }`. Data keys vary by endpoint, for example `jobs`, `jobDetail`, `companyList`, `cvList` and `pagination`. Many business errors currently use HTTP 200 with `code: "error"`; clients must inspect the response body.

Send text-only login/register requests as JSON. Upload forms use `multipart/form-data` with `avatar`, `logo`, `images` or `fileCV`. For `/job/apply`, send `fullName`, `email`, `phone`, `jobId` and `fileCV`.

## Deployment and cookie authentication

Render Web Service configuration:

```text
Build: yarn install --frozen-lockfile --production=false && yarn build
Start: yarn start
NODE_ENV=production
FRONTEND_ORIGIN=https://it-job-frontend.onrender.com
```

Provide the remaining database/JWT/Cloudinary variables in Render. Allow Render to set `PORT`. Keep `--production=false` during installation so TypeScript is installed even when `NODE_ENV=production`.

The frontend sends `credentials: "include"`; CORS allows its configured origin. In production, the API uses `SameSite=None` and `Secure` cookies. These flags do not share a host-only cookie with the separate frontend host: the frontend's current Next.js proxy needs a shared-origin/reverse-proxy or session-routing adjustment for hosted management-page navigation. Local development on the same `localhost` hostname avoids this particular host mismatch.

## Current limitations

- Public browsing/API data was checked after deployment; full authenticated and upload workflows need further end-to-end verification. Render Free may need time to wake after inactivity.
- CV submission is public, trusts the supplied email, and is not linked to an authenticated `userId`.
- Some profile/job updates replace media with empty values when no new file is provided; preserving existing media needs improvement.
- Schema constraints/indexes, upload type/size limits, error/status consistency and query performance need further work. Deleting a job does not cascade-delete its CV records.
- No automated test suite, refresh-token flow or password-recovery flow is configured in this backend.

## Project context

An educational portfolio project maintained by [Trịnh Gia Hưng](https://github.com/HungTrinh30106). This API and the separate Next.js frontend are the two applications that make up IT Job.
