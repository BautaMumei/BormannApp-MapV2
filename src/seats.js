// src/seats.js
export const sectors = [
  {
    id: 'arriere_gauche',
    label: 'Côté arrière gauche',
    type: 'gradin',
    rows: [
      { row: 6, seats: 8 },
      { row: 5, seats: 3 },
      { row: 4, seats: 3 },
      { row: 3, seats: 6 },
      { row: 2, seats: 6 },
      { row: 1, seats: 5 },
    ],
  },
  {
    id: 'cote_gauche',
    label: 'Côté gauche',
    type: 'gradin',
    rows: [
      { row: 6, seats: 18 },
      { row: 5, seats: 14 },
      { row: 4, seats: 14 },
      { row: 3, seats: 15 },
      { row: 2, seats: 15 },
      { row: 1, seats: 13 },
    ],
  },
  {
    id: 'face_cote_gauche',
    label: 'Face côté gauche',
    type: 'gradin',
    rows: [
      { row: 6, seats: 18 },
      { row: 5, seats: 11 },
      { row: 4, seats: 11 },
      { row: 3, seats: 12 },
      { row: 2, seats: 12 },
      { row: 1, seats: 10 },
    ],
  },
  {
    id: 'face_gauche',
    label: 'Face gauche',
    type: 'gradin',
    rows: [
      { row: 6, seats: 12 },
      { row: 5, seats: 10 },
      { row: 4, seats: 10 },
      { row: 3, seats: 12 },
      { row: 2, seats: 12 },
      { row: 1, seats: 10 },
    ],
  },
  {
    id: 'face_droite',
    label: 'Face droite',
    type: 'gradin',
    rows: [
      { row: 6, seats: 12 },
      { row: 5, seats: 10 },
      { row: 4, seats: 10 },
      { row: 3, seats: 12 },
      { row: 2, seats: 12 },
      { row: 1, seats: 10 },
    ],
  },
  {
    id: 'face_cote_droite',
    label: 'Face côté droite',
    type: 'gradin',
    rows: [
      { row: 6, seats: 18 },
      { row: 5, seats: 11 },
      { row: 4, seats: 11 },
      { row: 3, seats: 12 },
      { row: 2, seats: 12 },
      { row: 1, seats: 10 },
    ],
  },
  {
    id: 'cote_droit',
    label: 'Côté droit',
    type: 'gradin',
    rows: [
      { row: 6, seats: 18 },
      { row: 5, seats: 14 },
      { row: 4, seats: 14 },
      { row: 3, seats: 15 },
      { row: 2, seats: 15 },
      { row: 1, seats: 13 },
    ],
  },
  {
    id: 'arriere_droit',
    label: 'Côté arrière droit',
    type: 'gradin',
    rows: [
      { row: 6, seats: 8 },
      { row: 5, seats: 3 },
      { row: 4, seats: 3 },
      { row: 3, seats: 6 },
      { row: 2, seats: 6 },
      { row: 1, seats: 5 },
    ],
  },
  // --- LOGES (autour de la piste) ---
  {
    id: 'loge-0g',
    label: 'Loge 0G (inutilisable)',
    type: 'loge',
    rows: [
      { row: 2, seats: 2 }, // rang du fond
      { row: 1, seats: 3 }, // rang devant la piste
    ],
  },
  {
    id: 'loge-1',
    label: 'Loge 1',
    type: 'loge',
    rows: [
      { row: 2, seats: 5 }, // rang du fond
      { row: 1, seats: 5 }, // rang devant la piste
    ],
  },
  {
    id: 'loge-2',
    label: 'Loge 2',
    type: 'loge',
    rows: [
      { row: 2, seats: 5 },
      { row: 1, seats: 5 },
    ],
  },
  {
    id: 'loge-3',
    label: 'Loge 3',
    type: 'loge',
    rows: [
      { row: 2, seats: 5 },
      { row: 1, seats: 5 },
    ],
  },
  {
    id: 'loge-4',
    label: 'Loge 4',
    type: 'loge',
    rows: [
      { row: 2, seats: 5 },
      { row: 1, seats: 5 },
    ],
  },
  {
    id: 'loge-5',
    label: 'Loge 5',
    type: 'loge',
    rows: [
      { row: 2, seats: 5 },
      { row: 1, seats: 5 },
    ],
  },
  {
    id: 'loge-6',
    label: 'Loge 6',
    type: 'loge',
    rows: [
      { row: 2, seats: 5 },
      { row: 1, seats: 5 },
    ],
  },
  {
    id: 'loge-7',
    label: 'Loge 7',
    type: 'loge',
    rows: [
      { row: 2, seats: 5 },
      { row: 1, seats: 5 },
    ],
  },
  {
    id: 'loge-8',
    label: 'Loge 8',
    type: 'loge',
    rows: [
      { row: 2, seats: 5 },
      { row: 1, seats: 5 },
    ],
  },
  {
    id: 'loge-9',
    label: 'Loge 9',
    type: 'loge',
    rows: [
      { row: 2, seats: 5 },
      { row: 1, seats: 5 },
    ],
  },
  {
    id: 'loge-10',
    label: 'Loge 10',
    type: 'loge',
    rows: [
      { row: 2, seats: 5 },
      { row: 1, seats: 5 },
    ],
  },
  {
    id: 'loge-11',
    label: 'Loge 11',
    type: 'loge',
    rows: [
      { row: 2, seats: 5 },
      { row: 1, seats: 5 },
    ],
  },
  {
    id: 'loge-12',
    label: 'Loge 12',
    type: 'loge',
    rows: [
      { row: 2, seats: 5 },
      { row: 1, seats: 5 },
    ],
  },
  {
    id: 'loge-0d',
    label: 'Loge 0D (inutilisable)',
    type: 'loge',
    rows: [
      { row: 2, seats: 2 }, // rang du fond
      { row: 1, seats: 3 }, // rang devant la piste
    ],
  },

  // --- BALCONS (individuels, 1 à 16 D et 1 à 16 G) ---
  // Chaque balcon = 2 rangs de 4 places (8 places)
  // Côté Droit : 1D (face droite) -> 16D (vers l'arrière)
  {
    id: 'balcon-1D',
    label: 'Balcon 1D',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },
  {
    id: 'balcon-2D',
    label: 'Balcon 2D',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },
  {
    id: 'balcon-3D',
    label: 'Balcon 3D',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },
  {
    id: 'balcon-4D',
    label: 'Balcon 4D',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },
  {
    id: 'balcon-5D',
    label: 'Balcon 5D',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },
  {
    id: 'balcon-6D',
    label: 'Balcon 6D',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },
  {
    id: 'balcon-7D',
    label: 'Balcon 7D',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },
  {
    id: 'balcon-8D',
    label: 'Balcon 8D',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },
  {
    id: 'balcon-9D',
    label: 'Balcon 9D',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },
  {
    id: 'balcon-10D',
    label: 'Balcon 10D',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },
  {
    id: 'balcon-11D',
    label: 'Balcon 11D',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },
  {
    id: 'balcon-12D',
    label: 'Balcon 12D',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },
  {
    id: 'balcon-13D',
    label: 'Balcon 13D',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },
  {
    id: 'balcon-14D',
    label: 'Balcon 14D',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },
  {
    id: 'balcon-15D',
    label: 'Balcon 15D',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },
  {
    id: 'balcon-16D',
    label: 'Balcon 16D',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },

  // Côté Gauche : 1G (face gauche) -> 16G (vers l'arrière)
  {
    id: 'balcon-1G',
    label: 'Balcon 1G',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },
  {
    id: 'balcon-2G',
    label: 'Balcon 2G',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },
  {
    id: 'balcon-3G',
    label: 'Balcon 3G',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },
  {
    id: 'balcon-4G',
    label: 'Balcon 4G',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },
  {
    id: 'balcon-5G',
    label: 'Balcon 5G',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },
  {
    id: 'balcon-6G',
    label: 'Balcon 6G',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },
  {
    id: 'balcon-7G',
    label: 'Balcon 7G',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },
  {
    id: 'balcon-8G',
    label: 'Balcon 8G',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },
  {
    id: 'balcon-9G',
    label: 'Balcon 9G',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },
  {
    id: 'balcon-10G',
    label: 'Balcon 10G',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },
  {
    id: 'balcon-11G',
    label: 'Balcon 11G',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },
  {
    id: 'balcon-12G',
    label: 'Balcon 12G',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },
  {
    id: 'balcon-13G',
    label: 'Balcon 13G',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },
  {
    id: 'balcon-14G',
    label: 'Balcon 14G',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },
  {
    id: 'balcon-15G',
    label: 'Balcon 15G',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },
  {
    id: 'balcon-16G',
    label: 'Balcon 16G',
    type: 'balcon',
    rows: [
      { row: 2, seats: 4 },
      { row: 1, seats: 4 },
    ],
  },
];

// Totaux utiles (pour affichage futur)
export const TOTAL_BALCON = 32 * 8; // 32 balcons de 8 places = 256
export const TOTAL_LOGES = 12 * 10 + 2 * 5; // 12 loges de 10 + 2 loges de 5 = 130
export const TOTAL_GRADIN = 520; // inchangé
