# syntax=docker/dockerfile:1.4
FROM --platform=$BUILDPLATFORM node:23-bullseye-slim as builder

RUN mkdir /lotchen-front
WORKDIR /lotchen-front

RUN npm install -g @angular/cli@18

COPY package.json package-lock.json ./
RUN npm ci

COPY apps/Lotchen ./

RUN npx run build
CMD ["npm", "run", "ssr:dev"]

#FROM builder as dev-envs
#
#RUN <<EOF
#apt-get update
#apt-get install -y --no-install-recommends git
#EOF
#
#RUN <<EOF
#useradd -s /bin/bash -m vscode
#groupadd docker
#usermod -aG docker vscode
#EOF
## install Docker tools (cli, buildx, compose)
#COPY --from=gloursdocker/docker / /
#
#CMD ["npm", "run", "ssr:dev"]
