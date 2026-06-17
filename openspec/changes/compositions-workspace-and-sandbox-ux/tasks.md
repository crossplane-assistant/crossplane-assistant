## 1. Liste des Compositions (ListCompositions.tsx)

- [ ] 1.1 Importer les icônes `Layers` et `Sparkles` depuis `lucide-react`
- [ ] 1.2 Ajouter la nouvelle colonne d'action "Workspace Access" dans le tableau, avec les trois raccourcis (Workspace, Visual, Sandbox) et appel à `e.stopPropagation()` sur le conteneur pour éviter l'ouverture du tiroir latéral
- [ ] 1.3 Mettre à jour l'en-tête du panneau de détails latéral (`renderDetailView`) pour ajouter les trois boutons alignés côte à côte

## 2. Workspace de Composition (CompositionWorkspace.tsx & CompositionGraph.tsx)

- [ ] 2.1 Initialiser l'état `isGraphCollapsed` en lisant depuis le `localStorage` pour persister les préférences de l'utilisateur
- [ ] 2.2 Supprimer l'effet d'auto-repli automatique (le hook `useEffect` surveillant `selected`) pour que le diagramme reste affiché lors d'un clic
- [ ] 2.3 Ajouter les états `zoom` (par paliers de 10% de 50% à 150%) et `maxHeight` (de 200px à 800px par pas de 100px), tous deux persistés dans le `localStorage`
- [ ] 2.4 Intégrer les contrôles graphiques interactifs (boutons `+`/`-` de zoom, boutons `+`/`-` de hauteur) dans l'en-tête de la zone du diagramme, à côté du bouton de repli
- [ ] 2.5 Transmettre les propriétés d'échelle et de hauteur au composant `<CompositionGraph />` ou les appliquer directement sur l'enveloppe parente de la zone d'affichage du graphe
- [ ] 2.6 Mettre à jour `CompositionGraph.tsx` pour appliquer dynamiquement la hauteur maximale et le niveau de zoom CSS (style inline avec `zoom` ou `transform: scale()`) sur le conteneur principal `.graph-container`

## 3. Validation et Tests de non-régression

- [ ] 3.1 Lancer la commande de build/vérification des types TypeScript pour valider l'intégrité du code frontend
- [ ] 3.2 Tester manuellement les redirections directes depuis la table principale et vérifier que le tiroir de détails ne s'ouvre pas
- [ ] 3.3 Vérifier que le diagramme de workflow reste ouvert lors du passage en mode Sandbox ou lors de la sélection de différents nœuds
- [ ] 3.4 Confirmer que l'état replié/déplié, le niveau de zoom, et la hauteur choisie sont bien mémorisés après rechargement de la page
