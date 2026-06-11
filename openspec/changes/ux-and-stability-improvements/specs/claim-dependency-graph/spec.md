## MODIFIED Requirements

### Requirement: Fetching and Rendering Claim Dependency Graph
The claim details view SHALL fetch the claim details and its tree representation, and recursively render them as a horizontal interactive tree of resources. The visual container of the graph SHALL utilize the maximum width available on the viewport, and the card nodes SHALL have wider dimensions and a dynamic height layout to completely prevent truncation and overlaps of metadata (age, version, namespace).

#### Scenario: Loading and rendering claim details page
- **WHEN** the user visits `/explore/claims/:ref`
- **THEN** the system fetches claim details from `/crossplane/claims/:ref` and the tree from `/crossplane/claims/:ref/tree`
- **THEN** the system recursively renders the tree using ClaimGraphNode components connected by visual lines using a full-width container (`max-w-full px-4 lg:px-8`)
- **THEN** the node cards render with wider horizontal bounds (`w-[390px]`) and auto-expanding dynamic height (`min-h-[90px] py-2.5 px-3.5` with no fixed vertical limits) so that namespace, age, and version indicators do not overlap or mask other labels
