## Purpose

This capability enables the application to embed frontend static assets directly into the Go binary at build time, eliminating the need for separate file serving infrastructure.
## Requirements
### Requirement: Binary embeds Angular build artifacts

The system SHALL embed the compiled Angular application assets into the Go binary at build time using Go's embed.FS package.

#### Scenario: Build includes frontend assets
- **WHEN** the binary is compiled
- **THEN** all Angular build output from ui/dist/crossplane-assistant-ui/browser/ is embedded in the binary

#### Scenario: Binary runs without external files
- **WHEN** the binary is executed
- **THEN** the application serves the frontend without requiring external file access

### Requirement: Static files served from embedded filesystem

The system SHALL serve static assets (HTML, JavaScript, CSS, images) directly from the embedded filesystem.

#### Scenario: Request for JavaScript file
- **WHEN** client requests /main.abc123.js
- **THEN** system serves the embedded JavaScript file with appropriate content-type header

#### Scenario: Request for CSS file
- **WHEN** client requests /styles.xyz789.css
- **THEN** system serves the embedded CSS file with content-type text/css

#### Scenario: Request for static asset
- **WHEN** client requests /assets/logo.png
- **THEN** system serves the embedded image file with appropriate content-type

### Requirement: HTTP cache headers for static assets

The system SHALL set appropriate cache headers for static assets to enable browser caching.

#### Scenario: Hashed asset files cached
- **WHEN** client requests a content-hashed file (e.g., main.abc123.js)
- **THEN** system sets long-term cache headers (e.g., Cache-Control: public, max-age=31536000)

#### Scenario: HTML files not cached
- **WHEN** client requests index.html
- **THEN** system sets no-cache headers to ensure latest version is always served

### Requirement: Deterministic Production Builds
The build environment SHALL be capable of executing deterministic clean installations using standard CI commands.

#### Scenario: Clean installation in CI
- **WHEN** `npm ci` is executed in the `ui` directory
- **THEN** npm installs all dependencies strictly matching the lockfile with zero resolution errors

