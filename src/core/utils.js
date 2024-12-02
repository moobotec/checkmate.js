export const Utils = {
    /**
     * Génère une liste de noms aléatoires.
     * @param {number} numNames - Nombre de noms à générer.
     * @param {number} maxLength - Longueur maximale des noms.
     * @returns {string[]} - Liste des noms générés.
     */
    generateRandomNames(numNames = 10, maxLength = 10) {
        const names = [];
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

        for (let i = 0; i < numNames; i++) {
            const length = Math.floor(Math.random() * (maxLength - 3 + 1)) + 3; // Longueur entre 3 et maxLength
            let name = '';
            for (let j = 0; j < length; j++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                name += characters[randomIndex];
            }
            names.push(name.charAt(0).toUpperCase() + name.slice(1)); // Première lettre en majuscule
        }

        return names;
    }
};