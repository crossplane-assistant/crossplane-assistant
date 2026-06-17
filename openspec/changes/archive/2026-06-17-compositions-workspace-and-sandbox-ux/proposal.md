## Why

L'accès actuel au Workspace depuis l'écran de liste des Compositions nécessite d'ouvrir d'abord le tiroir de détails puis de cliquer sur "Open Workspace". Ce flux de navigation est fastidieux lors de phases de développement itératif intensif. De plus, dans le Workspace, le diagramme "Blueprint Workflow Diagram" se referme automatiquement lors de l'accès au Bac à Sable ou lors de la sélection d'un élément, ce qui nuit à l'expérience de débogage et de prototypage, en particulier sur les graphes complexes.

## What Changes

- Ajout de boutons d'accès rapide (Workspace, Visual Canvas, Sandbox) directement dans chaque ligne du tableau de la liste des Compositions, avec arrêt de la propagation du clic pour ne pas déclencher le tiroir de détails de la ligne.
- Mise à jour du tiroir latéral de détails pour présenter ces trois mêmes accès de manière élégante et côte à côte.
- Suppression du repli automatique du volet "Blueprint Workflow Diagram" lors de la sélection d'un élément ou lors du passage à la vue Bac à Sable.
- Intégration de contrôles interactifs de zoom et d'ajustement de la hauteur maximale sur le conteneur du diagramme pour gérer efficacement les graphes de grande taille.
- Persistance de l'état ouvert/replié du diagramme dans le stockage local du navigateur (`localStorage`).

## Capabilities

### New Capabilities
<!-- Leave empty as no new capabilities are being introduced -->

### Modified Capabilities
- `composition-workspace`: Faciliter l'accès aux différentes vues (Workspace, Visual Canvas, Sandbox) depuis la liste des compositions, ajouter des contrôles d'affichage avancés (zoom, hauteur, persistance du repli) au diagramme de workflow, et en empêcher le repli involontaire.

## Impact

- `ui/src/components/ListCompositions.tsx` : Ajout de la colonne "Workspace Access" et enrichissement de l'en-tête du tiroir de détails.
- `ui/src/components/CompositionWorkspace.tsx` : Débrayage du repli automatique, intégration des contrôles de zoom/hauteur, et sauvegarde de l'état ouvert/replié dans `localStorage`.
- `ui/src/components/CompositionGraph.tsx` : Prise en charge de la hauteur dynamique et de l'échelle de zoom dynamique sur le conteneur du graphe.
