FROM node:10.15-slim
ARG BUILD_NUMBER
ARG GIT_REF
ARG GIT_DATE

RUN addgroup --gid 2000 --system appgroup && \
    adduser --uid 2000 --system appuser --gid 2000

# Create app directory
RUN mkdir -p /app
WORKDIR /app
ADD . .

RUN yarn --frozen-lockfile && \
    yarn build && \
    export BUILD_NUMBER=${BUILD_NUMBER} && \
    export GIT_REF=${GIT_REF} && \
    export GIT_DATE=${GIT_DATE} && \
    yarn record-build-info

ENV PORT=3000

EXPOSE 3000
RUN chown -R appuser:appgroup /app
USER 2000
CMD [ "yarn", "start" ]
