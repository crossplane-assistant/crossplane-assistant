## 1. Liste des Compositions (ListCompositions.tsx)

- [x] 1.1 Importer les icônes `Layers` et `Sparkles` depuis `lucide-react`
- [x] 1.2 Ajouter la nouvelle colonne d'action "Workspace Access" dans le tableau, avec les trois raccourcis (Workspace, Visual, Sandbox) et appel à `e.stopPropagation()` sur le conteneur pour éviter l'ouverture du tiroir latéral
- [x] 1.3 Mettre à jour l'en-tête du panneau de détails latéral (`renderDetailView`) pour ajouter les trois boutons alignés côte à côte

## 2. Workspace de Composition (CompositionWorkspace.tsx & CompositionGraph.tsx)

- [x] 2.1 Initialiser l'état `isGraphCollapsed` en lisant depuis le `localStorage` pour persister les préférences de l'utilisateur
- [x] 2.2 Supprimer l'effet d'auto-repli automatique (le hook `useEffect` surveillant `selected`) pour que le diagramme reste affiché lors d'un clic
- [x] 2.3 Ajouter les états `zoom` (par paliers de 10% de 50% à 150%) et `maxHeight` (de 200px à 800px par pas de 100px), tous deux persistés dans le `localStorage`
- [x] 2.4 Intégrer les contrôles graphiques interactifs (boutons `+`/`-` de zoom, boutons `+`/`-` de hauteur) dans l'en-tête de la zone du diagramme, à côté du bouton de repli
- [x] 2.5 Transmettre les propriétés d'échelle et de hauteur au composant `<CompositionGraph />` ou les appliquer directement sur l'enveloppe parente de la zone d'affichage du graphe
- [x] 2.6 Mettre à jour `CompositionGraph.tsx` pour appliquer dynamiquement la hauteur maximale et le niveau de zoom CSS (style inline avec `zoom` ou `transform: scale()`) sur le conteneur principal `.graph-container`

## 3. Validation et Tests de non-régression

- [x] 3.1 Lancer la commande de build/vérification des types TypeScript pour valider l'intégrité du code frontend
- [x] 3.2 Tester manuellement les redirections directes depuis la table principale et vérifier que le tiroir de détails ne s'ouvre pas
- [x] 3.3 Vérifier que le diagramme de workflow reste ouvert lors du passage en mode Sandbox ou lors de la sélection de différents nœuds
- [x] 3.4 Confirmer que l'état replié/déplié, le niveau de zoom, et la hauteur choisie sont bien mémorisés après rechargement de la page
