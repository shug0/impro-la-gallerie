# La Galerie

_La Galerie_ est une application web conçue pour projeter des œuvres d'art du Metropolitan Museum of Art, sélectionnées aléatoirement. Elle a été pensée pour être utilisée dans le cadre de spectacles, notamment d'improvisation théâtrale, en offrant un support visuel inspirant et élégant.

<img width="709" height="576" alt="image" src="https://github.com/user-attachments/assets/6da087d1-15d8-4874-a277-e598a074c8ec" />
<img width="1509" height="863" alt="image" src="https://github.com/user-attachments/assets/1f42a11a-d720-464c-8936-98aea4271221" />


## ✨ Fonctionnalités

- **Accès à l'art** : Affiche des œuvres de la collection du Metropolitan Museum of Art.
- **Modes de sélection** : Permet de choisir entre les "chefs-d'œuvre" (masterpieces) ou d'autres collections thématiques.
- **Affichage immersif** : Conçue pour la projection, avec un mode plein écran et une interface qui peut être masquée pour ne laisser place qu'à l'œuvre.
- **Navigation intuitive** : Contrôles simples au clavier pour faire défiler les œuvres, afficher les informations ou passer en plein écran.
- **Informations contextuelles** : Affiche les métadonnées de l'œuvre (titre, artiste, date) de manière discrète.
- **Performances optimisées** : Chargement progressif des images pour une expérience fluide.

## ⌨️ Raccourcis Clavier

- **`Entrée`** : Démarrer la galerie / Afficher l'œuvre suivante.
- **`Espace`** : Masquer / Afficher les informations de l'œuvre et l'interface.
- **`F`** : Activer / Désactiver le mode plein écran.
- **`E`** : Afficher l'écran de fin.
- **`Échap`** : Fermer l'écran de fin.

## 🛠️ Technologies utilisées

- **Framework** : [React](https://reactjs.org/) (avec [Vite](https://vitejs.dev/))
- **Langage** : [TypeScript](https://www.typescriptlang.org/)
- **Styling** : [Tailwind CSS](https://tailwindcss.com/)
- **Data Fetching** : [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Routing** : [React Router](https://reactrouter.com/)
- **Animations** : [Framer Motion](https://www.framer.com/motion/)
- **Tests** : [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/)

## 🚀 Démarrage rapide

### Prérequis

- Node.js (version 18 ou supérieure)
- npm / pnpm / yarn

### Installation

1.  Clonez le dépôt :
    ```bash
    git clone https://github.com/votre-utilisateur/la-galerie.git
    ```
2.  Naviguez dans le répertoire du projet :
    ```bash
    cd la-galerie
    ```
3.  Installez les dépendances :
    ```bash
    npm install
    ```

### Lancement

Pour démarrer le serveur de développement :

```bash
npm run dev
```

L'application sera accessible à l'adresse `http://localhost:5173`.

## 🔬 Scripts disponibles

- `npm run dev`: Lance le serveur de développement.
- `npm run build`: Compile l'application pour la production.
- `npm run lint`: Analyse le code avec ESLint.
- `npm run preview`: Lance un serveur local pour prévisualiser la version de production.
- `npm run test`: Lance les tests unitaires et d'intégration.
- `npm run test:ui`: Lance les tests avec une interface graphique.
- `npm run test:coverage`: Calcule la couverture de code des tests.

## 📄 Licence

Ce projet est distribué sous la licence MIT. Voir le fichier [LICENSE](./LICENSE) pour plus de détails.
