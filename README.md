# majestic-app

This application is for Prof. Brian Majestic of the University of Denver Chemistry Department. It is meant to recieve data from a set of Lunar Outpost Canary-S sensors, store that data in a Postgres database, and display that data through a NodeJs/Express/Vue front end. The data is also avaliable for download.

## Project Structure

### src/

#### view/

This folder holds the Vue app for the front end.

#### public/

This folder holds the template for `index.html`, which is copied to the dist folder during compilation.

### app.js

This is the entry point for the Express server.

### db.js

This code handles interactions with the Postgres database.

## Setup

Clone this repository to your local machine and install dependencies through `npm`:

> `git clone <path to repo>`
> `npm install`

## Development Mode

Use the `dev` command in `package.json` to run the webpack development server:

> `npm run dev`

The development mode is for working on the front end. The dev server will only hot-reload based on changes made in the `view` folder. 

## Running the Express Server

Run `src/app.js` under node to start the express server. The express server expects a compiled version of the front-end to exist in a `view` subdirectory. Use the `serve` command to run the build process and start the express server.

## Docker & Deployment

This repository contains a `Dockerfile`, which allows the application to be run as a docker container. A full deployment of the application also includes a running instance of a `postgres` container that this application can connect to. Details to follow.

### Environment Variables

Successful deployment of the application requires a pair of `.env` filse which hold environment variables about the postgres database. The first of these env files should be called `.db.env` and specifies parameters for the postgres database. The second of these env files should be called `.web.env` and is for the web portion of the app and gives information on how to connect to the running postgres image. 

See the "Environment Variables" section of the [postgres docker image](https://hub.docker.com/_/postgres) and the "Connecting" section of the [node-postgres documentation](https://node-postgres.com/features/connecting) for more details. For these files, the following environment variables are required:

#### Postgres Image Variables (`.db.env`):
- POSTGRES_PASSWORD
- POSTGRES_USER
- POSTGRES_DB
- PGDATA

#### Node-Postgres module variables (`.web.env`):
- PGHOST
- PGUSER
- PGDATABASE
- PGPASSWORD
- PGPORT

