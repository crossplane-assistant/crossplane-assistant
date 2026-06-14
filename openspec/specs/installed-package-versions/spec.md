# installed-package-versions Specification

## Purpose
TBD - created by syncing change show-installed-package-versions. Update Purpose after archive.

## Requirements

### Requirement: Extract version from package string
The frontend application SHALL provide a utility function that parses a package image identifier string to extract the version tag. If a colon (`:`) is present, the function SHALL extract the part after the last colon as the version. If no colon is present or the string is empty, the function SHALL return a default value of `'latest'`.

#### Scenario: Extraction with tag
- **WHEN** the package image string is `xpkg.upbound.io/crossplane-contrib/provider-kubernetes:v0.3.0`
- **THEN** the utility returns `v0.3.0`

#### Scenario: Extraction without tag
- **WHEN** the package image string is `xpkg.upbound.io/crossplane-contrib/provider-kubernetes`
- **THEN** the utility returns `latest`

#### Scenario: Extraction with empty string
- **WHEN** the package image string is empty or undefined
- **THEN** the utility returns `Unknown`

### Requirement: Providers list table shows Version column
The list of installed Providers (`ListProviders.tsx`) SHALL include a 'Version' column positioned after 'Name' and before 'Healthy'. This column SHALL render the extracted package version of the provider inside a styled monospace badge.

#### Scenario: Displaying provider version in the table
- **WHEN** the installed Providers table is loaded and contains a provider with `spec.package` set to `xpkg.upbound.io/upbound/provider-aws-s3:v1.0.0`
- **THEN** the 'Version' column displays `v1.0.0` inside a styled monospace badge.

### Requirement: Functions list table shows Version column
The list of installed Composition Functions (`ListFunctions.tsx`) SHALL include a 'Version' column positioned after 'Name' and before 'Healthy'. This column SHALL render the extracted package version of the function inside a styled monospace badge.

#### Scenario: Displaying function version in the table
- **WHEN** the installed Functions table is loaded and contains a function with `spec.package` set to `xpkg.upbound.io/crossplane/function-patch-and-transform:v0.3.0`
- **THEN** the 'Version' column displays `v0.3.0` inside a styled monospace badge.
