# composition-workspace Specification

## Purpose
TBD - created by archiving change composition-workspace. Update Purpose after archive.
## Requirements
### Requirement: Full-Screen Composition Workspace
The system SHALL provide a dedicated, full-screen route at `/explore/compositions/:name` acting as a "Composition Workspace". This workspace SHALL be divided into a left-hand navigation tree and a right-hand main viewing pane to provide an immersive IDE-like inspection environment for complex Compositions.

#### Scenario: Navigating to the Composition Workspace
- **WHEN** the user clicks "Open Workspace" on a Composition from the list or side panel
- **THEN** the system navigates to `/explore/compositions/:name`
- **THEN** the workspace loads full-screen without side panels

### Requirement: Tree-Based Composition Navigation
The left-hand navigation tree SHALL parse and display the hierarchical structure of the Composition. It SHALL display pipeline steps, their raw input configurations, the composed resources extracted from those steps, and the active Claims utilizing this Composition.

#### Scenario: Viewing the Navigation Tree
- **WHEN** the user is in the Composition Workspace
- **THEN** the left panel displays a hierarchical tree of Pipeline Steps, Resources, and Active Claims
- **THEN** clicking on a tree node updates the URL query parameters (e.g., `?selected=resource:RDSInstance`)

### Requirement: Dynamic Main Workspace Pane
The Composition Workspace SHALL provide a navigation sidebar to inspect pipelines, composed resources, active claims, and a new option to enter Sandbox mode or Visual Canvas mode. The main view pane SHALL share a unified state manager so that transitions between textual editing (Monaco), visual editing (Canvas), and Sandbox simulation happen seamlessly without data loss.

#### Scenario: Navigating to the Sandbox mode
- **WHEN** the user selects the "Sandbox Playpen" node in the tree navigation or clicks the header action
- **THEN** the URL is updated to `?selected=sandbox`
- **THEN** the main view pane splits into an Input section (with Dummy Claim and Composition editors) and an Output section (Rendered Resources and Diagnostics)

#### Scenario: Initializing the Sandbox View
- **WHEN** the Sandbox mode is rendered for the first time
- **THEN** the Dummy Claim editor is pre-populated automatically via the Dummy Claim YAML Generation algorithm
- **THEN** the Composition editor is pre-populated with the actual live YAML of the current Composition
- **THEN** a "Render / Simulate" action button is available to submit the payload to the backend

#### Scenario: Navigating to the Canvas mode
- **WHEN** the user selects the "Visual Canvas" toggle in the header action
- **THEN** the URL is updated to `?view=canvas`
- **THEN** the textual Monaco editor is replaced (or split) with the React Flow Canvas representation of the current Composition YAML state

### Requirement: Quick Workspace Access from Compositions List
La liste des compositions SHALL inclure une colonne "Workspace Access" avec trois boutons d'accès rapide compacts : "Workspace" (liaison standard), "Visual" (redirection canvas) et "Sandbox" (redirection bac à sable).

#### Scenario: Accès direct à la Sandbox
- **WHEN** l'utilisateur clique sur le bouton "Sandbox" d'une ligne de composition
- **THEN** l'application redirige vers la route du Workspace de cette composition avec le paramètre de requête `?selected=sandbox`

### Requirement: Row Navigation Event Separation
Le clic sur les boutons d'accès rapide dans une ligne de composition MUST arrêter la propagation de l'événement de clic pour éviter d'ouvrir involontairement le tiroir latéral de détails de la ressource.

#### Scenario: Clic sur l'accès direct sans ouverture du tiroir
- **WHEN** l'utilisateur clique sur le bouton "Visual" dans la ligne d'une composition
- **THEN** l'application redirige l'utilisateur vers le Visual Canvas de la composition
- **THEN** le tiroir de détails de la composition ne s'ouvre pas

### Requirement: Sidebar Detail Panel Workspace Links
Le tiroir de détails d'une composition (affiché au clic sur une ligne) SHALL proposer en en-tête des boutons d'accès direct alignés pour les trois modes (Tree Workspace, Visual Builder, Dry-Run Sandbox) afin de faciliter la navigation.

#### Scenario: Affichage et navigation depuis le tiroir de détails
- **WHEN** le tiroir de détails d'une composition est affiché
- **THEN** trois boutons "Tree Workspace", "Visual Builder" et "Dry-Run Sandbox" sont visibles dans l'en-tête
- **THEN** cliquer sur l'un d'eux redirige l'utilisateur vers la vue correspondante

### Requirement: Persistent and Manual Workflow Diagram Collapse
Le volet "Blueprint Workflow Diagram" du Workspace ne SHALL plus se replier automatiquement lors du clic sur un nœud du graphe ou de la sélection d'un élément dans l'arbre. De plus, l'état ouvert/replié de ce volet SHALL être mémorisé et restauré via le `localStorage`.

#### Scenario: Maintien de l'ouverture du diagramme
- **WHEN** le diagramme de workflow est ouvert
- **WHEN** l'utilisateur clique sur une étape de pipeline ou accède à la Sandbox
- **THEN** le volet "Blueprint Workflow Diagram" reste ouvert
- **THEN** l'état replié/déplié reste persistant après rechargement grâce à `localStorage`

### Requirement: Interactive Diagram Zoom and Height Scaling
Le volet du diagramme de workflow SHALL proposer des boutons interactifs de contrôle pour ajuster l'échelle de zoom (de 50% à 150%) et modifier la hauteur maximale de la zone d'affichage (toggling de la hauteur entre 200px et 800px) afin de faciliter la lecture de graphes très denses ou de grande taille.

#### Scenario: Utilisation du zoom et de la hauteur dynamique
- **WHEN** l'utilisateur clique sur les boutons de zoom `+` ou `-` de l'en-tête du diagramme
- **THEN** le graphe de la composition est redimensionné en direct avec la valeur d'échelle correspondante
- **WHEN** l'utilisateur modifie la hauteur de la zone via les boutons d'ajustement
- **THEN** la hauteur maximale du diagramme s'ajuste en direct entre les valeurs prédéfinies

