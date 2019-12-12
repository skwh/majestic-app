# majestic-app

This application is for Prof. Brian Majestic of the University of Denver Chemistry Department. It is meant to recieve data from a set of Lunar Outpost Canary-S sensors, store that data in a Postgres database, and display that data through a NodeJs/Express/Vue front end. The data is also avaliable for download.

## Project Structure

### src/

#### src/view/

This folder holds the Vue app for the front end.

#### src/public/

This folder holds the template for `index.html`, which is copied to the dist folder during compilation, as well as any other static assets, such as images or icons.

#### src/app.js

This module defines the behavior of the express server. This code is contained in a function for easy dependency injection.

#### src/db.js

This module defines an interface between the application and the postgres database. 

#### src/utils.js

This module contains utility functions used in the express server. Most logic which can be abstracted away from Express-specific tasks has been turned into utility functions.

#### src/server.js

The entry point for the express server when the project is deployed.

### test/

#### test/api/ 

This folder holds tests for the backend. One test file tests the express server, whereas the other tests the utility functions.

#### test/data/

This folder holds csv or json files of data for use in automated or manual testing.

#### test/manual/

This folder holds scripts which assist in manual tests.

#### test/view/

This folder holds tests for the front-end of the application.

### db/

This folder contains a setup SQL file necessary for defining the initial state of the database when it is created for the first time, as well as a Docker file combining this setup file into the Postgres image.

### build/

This folder holds build scripts.

## Setup

Clone this repository to your local machine and install dependencies through `npm`:

> `git clone <path to repo>`

> `npm install`

For development, you'll also want to have a docker environment on your system.

## Development Mode

Because this codebase is for a full stack application, there are multiple development modes available, depending on what part of the application is being worked on.

### Vue Development Mode

Use the `vue-dev` command in `package.json` to run the webpack development server:

> `npm run vue-dev`

The development mode is for working on the front end. The dev server will only hot-reload based on changes made in the `view` folder. 

### Docker / Node Development Mode

This mode is invoked when working with the back end. Using the given `docker-compose` files, the following set of commands set up the application with a set of development port bindings:

> `docker-compose build && docker-compose up`

The development port bindings expose the express server at port 8000 and the database at port 7654. In production the database is not exposed.

If the Vue webpack live reload server is running at the same time as the docker containers, the front-end will ping the local development container's api.

## Testing

Tests are written using Chai and Mocha. (Mmmmm, coffee.)

You can run tests for the front end using the `test:vue` script. Similarly, you can run tests for the back end using `test:api`. If you want to run all the tests, you can stick with `npm run test`.

## Running the Express Server

Run `src/app.js` under node to start the express server. The express server expects a compiled version of the front-end to exist in a `view` subdirectory. Use the `serve` command to run the build process and start the express server:

> `npm run serve`

## Docker & Deployment

This repository contains a `Dockerfile`, which allows the application to be run as a docker container. A full deployment of the application also includes a running instance of a `postgres` container that this application can connect to. Details to follow.

### Environment Variables

Successful deployment of the application requires a pair of `.env` filse which hold environment variables about the postgres database. The first of these env files should be called `.db.env` and specifies parameters for the postgres database. The second of these env files should be called `.web.env` and is for the web portion of the app and gives information on how to connect to the running postgres image. 

This separation is necessary because Docker Compose will abstract the postgres container behind a service. Therefore the web application needs different information to connect to that service than the actual postgres container will use to set itself up.

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

## Database Configuration

The database holds up to 6 months' worth of data from any sensors that have been connected to the application.