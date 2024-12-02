
# checkmat.js

CheckMat.js est une bibliothèque JavaScript complète et autonome dédiée à l'affichage, la manipulation, et l'interaction avec des jeux d'échecs. Cette bibliothèque est conçue pour être flexible, intuitive et facilement intégrable dans tout projet web.

---

## **Fonctionnalités principales**

- **Échiquier interactif :** Créez un échiquier complet avec gestion des pièces, surbrillances dynamiques et interactions utilisateurs.
- **Validation des règles :** Support complet des règles du jeu d'échecs, incluant le roque, la prise en passant, et la promotion.
- **Notations standard :** Génération et lecture des notations PGN et FEN.
- **Gestion des parties :** Suivi de l'historique des coups, annulation et restauration de mouvements, export/import de parties.
- **Personnalisation :** Apparence, gestion des événements et règles configurables.
- **Conception modulaire :** Architecture modulaire pour faciliter l'extension et l'intégration.

---

## **L'interface**

![checkmate.js](img/checkmate.png)

---

## **Installation**

### 1. Téléchargement
Clonez le dépôt GitHub pour obtenir les fichiers source :
```bash
git clone https://github.com/votre-utilisateur/checkmat.js.git
```

### 2. Inclusion dans le projet
Ajoutez les fichiers nécessaires à votre projet web. checkmat.js dépend de jQuery pour certaines fonctionnalités interactives :

```html
<!-- Inclure les fichiers de CheckMat.js -->
<link rel="stylesheet" href="checkmat.css">
<script type="module" src="checkmat.js"></script>
```

### 3. Styles personnalisés

Le fichier CSS `checkmate.css` personnalise l'apparence du module 

### 4. Dépendances

- [jQuery](https://jquery.com) (3.5.1+)
- [Bootstrap](https://getbootstrap.com) (4.5.2+)
- [Font Awesome](https://fontawesome.com) pour des icônes élégantes.

---

## Utilisation

1. Intégrez un élément HTML pour le champ de saisie.
   ```html
   <div id="checkmatContainer"></div>
   ```
2. Initialisez le plugin avec jQuery :
   ```javascript
    $(document).ready(function() {
        $('#checkmatContainer').checkmatBuilder({});
    });
   ```

---

## **Licence**

Ce projet est sous licence MIT. Consultez le fichier [LICENSE](LICENSE) pour plus de détails.

---

