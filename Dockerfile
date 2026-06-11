# HAVEN relay image for StartOS: builds the upstream haven binary from source
# at a pinned ref, mirroring haven-kit's haven-relay/Dockerfile.

FROM golang:alpine AS builder

RUN apk add --no-cache git build-base

WORKDIR /build

# Clone haven repository (pinned for reproducible builds).
# Currently pinned to a commit = v1.2.2 + the .onion relay URL prefix fix
# (barrydeen/haven#125); move back to a release tag once upstream tags it.
ARG HAVEN_VERSION=c8b61d22902ce057b64a8ee2b487ab5d0a7fbd23
RUN git clone https://github.com/barrydeen/haven.git . && \
    git checkout ${HAVEN_VERSION}

RUN go mod download && \
    CGO_ENABLED=1 go build -o haven .

# Final stage - minimal runtime image
FROM alpine:latest

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /haven

COPY --from=builder /build/haven /haven/haven
COPY --from=builder /build/templates /haven/templates

# Wrapper entrypoint: syncs /haven-config/.env into /haven/.env on every start
# and refuses to launch haven until the npub settings are real (haven panics
# on a missing/invalid npub, which would otherwise crash-loop fresh installs).
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

RUN mkdir -p /haven/blossom /haven/db

EXPOSE 3355

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/haven/haven"]
