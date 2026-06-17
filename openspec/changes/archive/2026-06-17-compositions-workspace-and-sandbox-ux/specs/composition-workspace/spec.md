## ADDED Requirements

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
