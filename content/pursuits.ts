import type { Locale } from './types';

/*
 * Deux listes défilantes, en sens inverse : l'une pour le travail, l'autre pour la course.
 * Des phrases courtes — au-delà de cinq ou six mots, elles deviennent illisibles en mouvement.
 *
 * PROPOSITION à relire et à corriger : ces lignes reformulent ce qu'Aj a décrit.
 * Tout ce qui ne sonne pas juste doit être remplacé ou supprimé.
 */
export const pursuits: Record<Locale, [string[], string[]]> = {
  en: [
    ['Build things that ship', 'Learn by doing', 'Finish what I start', 'Start the next one'],
    ['Give everything, every time', 'Push to the limit', 'Move the limit', 'Go again tomorrow'],
  ],
  fr: [
    ['Construire des choses qui sortent', 'Apprendre en faisant', 'Finir ce que je commence', 'Lancer le suivant'],
    ['Donner le maximum à chaque fois', 'Me pousser à bout', 'Repousser mes limites', 'Repartir demain'],
  ],
};
