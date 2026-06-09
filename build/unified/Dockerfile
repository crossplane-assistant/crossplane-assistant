# Use distroless base image for minimal attack surface
FROM gcr.io/distroless/base-debian12:nonroot

# Copy the pre-built binary
COPY crossplane-assistant /crossplane-assistant

# Set the entrypoint
ENTRYPOINT ["/crossplane-assistant"]
