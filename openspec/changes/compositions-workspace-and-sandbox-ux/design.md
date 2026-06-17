## Context

L'ergonomie d'accès aux différentes vues d'une Composition (Workspace standard, Visual Canvas et Bac à sable/Sandbox) est un point d'amélioration clé pour fluidifier le flux de travail des ingénieurs plateforme. De plus, la visualisation du graphe de workflow ("Blueprint Workflow Diagram") présente des frustrations : il se ferme automatiquement lors de la sélection de nœuds (ou du passage en mode bac à sable) et sa taille est fixe (rendant les grands graphes peu lisibles).

## Goals / Non-Goals

**Goals:**
- Offrir des boutons d'accès direct clairs (Workspace, Visual, Sandbox) sur chaque ligne de la liste des compositions.
- Empêcher l'ouverture involontaire du tiroir de détails lors du clic sur ces raccourcis dans le tableau.
- Intégrer les raccourcis dans le tiroir de détails.
- Garder le "Blueprint Workflow Diagram" déplié par défaut et empêcher son repli automatique.
- Ajouter des contrôles interactifs de Zoom (50% à 150%) et d'ajustement de hauteur (200px à 800px) sur le graphe.
- Persister l'état replié/déplié dans le `localStorage` du navigateur.

**Non-Goals:**
- Modifier le comportement de l'éditeur de code Monaco ou des requêtes backend.
- Intégrer une solution de zoom complexe tierce (garder des contrôles CSS natifs simples, performants et robustes).

## Decisions

### Décision 1 : Boutons compacts en ligne avec arrêt de propagation
- **Quoi** : Ajouter une colonne "Workspace Access" à la liste dans `ListCompositions.tsx`.
- **Pourquoi** : Un accès direct en un clic fait gagner beaucoup de temps.
- **Détail d'implémentation** : Les composants `<Link>` seront enveloppés dans un `div` ayant un écouteur `onClick={(e) => e.stopPropagation()}` pour éviter que le clic ne soit interprété par la ligne du tableau (`<tr>`) comme une commande d'ouverture du tiroir latéral.
- **Alternatives considérées** : Menu déroulant d'actions (plus lent, nécessite un clic supplémentaire pour ouvrir le menu).

### Décision 2 : Gestion de l'état du diagramme avec localStorage
- **Quoi** : Mémoriser l'état replié (`isGraphCollapsed`) dans le stockage local du navigateur.
- **Pourquoi** : Si un utilisateur préfère travailler sur un écran compact et ferme le graphe, son choix doit être préservé.
- **Détail d'implémentation** :
  ```typescript
  const [isGraphCollapsed, setIsGraphCollapsed] = React.useState(() => {
    return localStorage.getItem('composition-workspace:graph-collapsed') === 'true';
  });
  
  // Sauvegarde à chaque changement de l'état
  React.useEffect(() => {
    localStorage.setItem('composition-workspace:graph-collapsed', String(isGraphCollapsed));
  }, [isGraphCollapsed]);
  ```

### Décision 3 : Suppression du repli automatique
- **Quoi** : Supprimer l'effet `useEffect` qui replie automatiquement le diagramme à chaque fois que la variable d'état `selected` change.
- **Pourquoi** : Permet de garder le diagramme ouvert et sous les yeux même après avoir cliqué sur une ressource de l'arbre ou sur un bouton de simulation de la sandbox.

### Décision 4 : Zoom et Hauteur personnalisable du diagramme de workflow
- **Quoi** : Ajouter deux états locaux (`zoom` et `graphHeight`) dans le Workspace et les passer à la zone d'affichage du graphe.
- **Pourquoi** : Les grands graphes ont besoin de plus de hauteur verticale et d'une échelle réduite pour être appréhendés d'un seul coup d'œil.
- **Détail d'implémentation** :
  - **Zoom** : Ajustement par paliers de 10% de `50%` à `150%` (via style inline CSS `zoom: zoom / 100` ou `transform: scale(zoom/100)`). L'utilisation de CSS `zoom` ou d'un transform CSS propre sur le conteneur du graphe est extrêmement performante.
  - **Hauteur** : Sélectionneur ou toggle de hauteur (par exemple un bouton toggle cyclique entre `300px`, `500px` et `800px`, ou des boutons `+`/`-` de hauteur de `200px` à `800px` avec un pas de `100px`).
  - Ces états seront également persistés dans `localStorage` pour une expérience utilisateur impeccable.

## Risks / Trade-offs

- **[Risk] Compatibilité du Zoom CSS** → Bien que la propriété `zoom` soit largement supportée aujourd'hui par tous les navigateurs modernes (Chrome, Safari, Firefox), nous utiliserons un conteneur d'affichage propre avec `transform: scale()` et `transformOrigin: top left` ou `zoom` selon la meilleure restitution esthétique pour préserver la netteté des connecteurs SVG/CSS du graphe.
- **[Risk] Encombrement de l'interface** → L'ajout de trop de boutons d'accès rapide dans la liste pourrait réduire la largeur disponible pour les autres colonnes. Nous veillerons à ce que les boutons soient compacts et s'affichent uniquement sur les écrans de taille standard et supérieure.
