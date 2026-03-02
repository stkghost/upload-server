# install base image with an alias
FROM node:20.18 AS base

# install pnpm globally
RUN npm i -g pnpm

# install dependencies
FROM base as dependecies

# create a folter to centralize the app
WORKDIR /usr/src/app

# copy packge.json and lock files to the app folder
COPY package.json pnpm-lock.yaml ./

# install dependecies with pnpm
RUN pnpm install

# create a build image build from base image
FROM base AS build

# create a folter to centralize the app
WORKDIR /usr/src/app

# copy all files from the app to the app folder
COPY . .
# copy node_modules from "dependecies" image to the "build" image
COPY --from=dependecies /usr/src/app/node_modules ./node_modules

# build the app
RUN pnpm run build

# discard envs
RUN pnpm prune --prod

FROM cgr.dev/chainguard/node:latest AS deploy

USER 1000

WORKDIR /usr/src/app

# copy the required files and folders to the deploy image
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./package.json

# expose the app port
EXPOSE 3333

# run the command to execute the container
CMD ["dist/infra/http/server.mjs"]