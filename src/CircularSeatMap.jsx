// src/CircularSeatMap.jsx
import React, { useState, useEffect } from 'react';
import { sectors } from './seats';

// mêmes couleurs que dans SeatMap
const STATUS_COLORS = {
  free: '#93c47d',
  reserved: '#f6b26b',
  occupied: '#e06666',
};

// Configuration des GRADINS : angle central + ouverture (en degrés)
// 0° = à droite, 90° = en bas, 180° = à gauche, 270° = en haut (entrée artistes)
const GRADIN_CONFIG = {
  // 🔹 Arrière : secteurs courts et serrés, un peu plus proches du centre
  'Côté arrière gauche': { angle: 240, span: 15 }, // ~229–251
  'Côté arrière droit': { angle: 300, span: 15 }, // ~289–311

  // 🔹 Côtés : blocs intermédiaires
  'Côté gauche': { angle: 205, span: 40 }, // 190–220
  'Côté droit': { angle: 335, span: 40 }, // 320–350

  // 🔹 Face côté : assez compacts
  'Face côté gauche': { angle: 160, span: 33 }, // 146–174
  'Face côté droite': { angle: 20, span: 33 }, // 6–34

  // 🔹 Face : plus aérés, bien centrés en bas
  'Face gauche': { angle: 115, span: 32 }, // 109–141
  'Face droite': { angle: 65, span: 32 }, // 39–71
};

// Configuration des LOGES : angle + groupe pour différencier visuellement
// Face = 5–8, Droite = 1–4, Gauche = 9–12, Arrière = 0G / 0D
// Répartition symétrique autour de la piste (~22° d'espacement)
// Espace libre à l'arrière: 210° → 330° (120° centré sur 270° = entrée artistes)
// Espacement de 30° entre loges arrière et loges actives
const LOGE_CONFIG = {
  // Arrière - symétriques par rapport à 270°
  'Loge 0G (inutilisable)': { angle: 240, group: 'back' },
  'Loge 0D (inutilisable)': { angle: 300, group: 'back' },

  // Côté droit (1 → 4)
  'Loge 1': { angle: 330, group: 'right' },
  'Loge 2': { angle: 352, group: 'right' },
  'Loge 3': { angle: 14, group: 'right' },
  'Loge 4': { angle: 36, group: 'right' },

  // Face (5 → 8)
  'Loge 5': { angle: 58, group: 'front' },
  'Loge 6': { angle: 80, group: 'front' },
  'Loge 7': { angle: 102, group: 'front' },
  'Loge 8': { angle: 124, group: 'front' },

  // Côté gauche (9 → 12)
  'Loge 9': { angle: 146, group: 'left' },
  'Loge 10': { angle: 168, group: 'left' },
  'Loge 11': { angle: 190, group: 'left' },
  'Loge 12': { angle: 210, group: 'left' },
};

// Configuration des BALCONS : angle + ouverture pour chaque balcon
// Chaque balcon = 8 places (2 rangs de 4)
// Répartis de manière égale derrière chaque zone de gradins avec espacement optimal
const BALCON_CONFIG = {
  // CÔTÉ DROIT (1D à 16D)

  // 1D, 2D, 3D : derrière Face droite (49-81°, span 32°) - 3 balcons espacés de 10.67°
  'Balcon 1D': { angle: 54, span: 8 },
  'Balcon 2D': { angle: 65, span: 8 },
  'Balcon 3D': { angle: 76, span: 8 },

  // 4D à 13D : derrière Face côté droite (3.5-36.5°) + Côté droit (315-355°)
  // Zone continue de 315° à 36.5° (81.5° total) - 10 balcons espacés de 8.15°
  'Balcon 4D': { angle: 319, span: 8 },
  'Balcon 5D': { angle: 327, span: 8 },
  'Balcon 6D': { angle: 335, span: 8 },
  'Balcon 7D': { angle: 344, span: 8 },
  'Balcon 8D': { angle: 352, span: 8 },
  'Balcon 9D': { angle: 0, span: 8 },
  'Balcon 10D': { angle: 8, span: 8 },
  'Balcon 11D': { angle: 16, span: 8 },
  'Balcon 12D': { angle: 24, span: 8 },
  'Balcon 13D': { angle: 32, span: 8 },

  // 14D, 15D, 16D : derrière Côté arrière droit (292.5-307.5°, span 15°) - 3 balcons espacés de 5°
  'Balcon 14D': { angle: 295, span: 8 },
  'Balcon 15D': { angle: 300, span: 8 },
  'Balcon 16D': { angle: 305, span: 8 },

  // CÔTÉ GAUCHE (1G à 16G)

  // 1G, 2G, 3G : derrière Face gauche (99-131°, span 32°) - 3 balcons espacés de 10.67°
  'Balcon 1G': { angle: 104, span: 8 },
  'Balcon 2G': { angle: 115, span: 8 },
  'Balcon 3G': { angle: 126, span: 8 },

  // 4G à 13G : derrière Face côté gauche (143.5-176.5°) + Côté gauche (185-225°)
  // Zone continue de 143.5° à 225° (81.5° total) - 10 balcons espacés de 8.15°
  'Balcon 4G': { angle: 148, span: 8 },
  'Balcon 5G': { angle: 156, span: 8 },
  'Balcon 6G': { angle: 164, span: 8 },
  'Balcon 7G': { angle: 172, span: 8 },
  'Balcon 8G': { angle: 180, span: 8 },
  'Balcon 9G': { angle: 189, span: 8 },
  'Balcon 10G': { angle: 197, span: 8 },
  'Balcon 11G': { angle: 205, span: 8 },
  'Balcon 12G': { angle: 213, span: 8 },
  'Balcon 13G': { angle: 221, span: 8 },

  // 14G, 15G, 16G : derrière Côté arrière gauche (232.5-247.5°, span 15°) - 3 balcons espacés de 5°
  'Balcon 14G': { angle: 235, span: 8 },
  'Balcon 15G': { angle: 240, span: 8 },
  'Balcon 16G': { angle: 245, span: 8 },
};

export default function CircularSeatMap({
  seatStates,
  toggleSeat,
  seatGroups = {},
  groupColorMap = {},
}) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const size = 800;
  const center = size / 2;

  // Gradins : seuls les secteurs connus dans GRADIN_CONFIG
  const gradinSectors = sectors.filter((s) => GRADIN_CONFIG[s.label] != null);

  // Loges : secteurs connus dans LOGE_CONFIG
  const logeSectors = sectors.filter((s) => LOGE_CONFIG[s.label] != null);

  // Balcons : secteurs connus dans BALCON_CONFIG
  const balconSectors = sectors.filter((s) => BALCON_CONFIG[s.label] != null);

  if (!gradinSectors.length) {
    return (
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <em>Pas de secteurs de gradins trouvés pour le plan circulaire.</em>
      </div>
    );
  }

  // nb de rangs max pour calibrer les gradins
  const maxGradinRows = Math.max(
    ...gradinSectors.flatMap((s) => s.rows.map((r) => r.row))
  );

  // --- Réglages de rayons ---
  const pisteRadius = size * 0.08;
  const logeInnerRadius = pisteRadius + 22; // premier rang de loges - plus d'espace depuis la piste
  const logeRowSpacing = 12; // entre rang 1 et 2 des loges

  // Gap important entre loges et gradins
  const logeOuterZone = logeInnerRadius + logeRowSpacing * 2 + 8;
  const gradinBaseRadius = logeOuterZone + 15; // premier rang de gradins - gap clair
  const gradinRowSpacing = (size * 0.22) / maxGradinRows;

  // Balcons : au-delà des gradins avec gap important
  const maxGradinRadius = gradinBaseRadius + maxGradinRows * gradinRowSpacing;
  const balconBaseRadius = maxGradinRadius + 20; // premier rang de balcons - gap clair
  const balconRowSpacing = 7; // entre rang 1 et 2 des balcons

  const logeAngleSpan = 18; // ouverture d'une loge
  const balconAngleSpan = 7; // ouverture d'un balcon (plus lisible)

  // 🔹 Normalisation du siège : gère strings ("free") ou objets { status, group }
  const getSeatInfo = (seatId) => {
    const raw = seatStates?.[seatId];

    if (!raw) {
      return {
        status: 'free',
        group: seatGroups?.[seatId] || null,
      };
    }

    if (typeof raw === 'string') {
      return {
        status: raw,
        group: seatGroups?.[seatId] || null,
      };
    }

    // format objet
    return {
      status: raw.status || 'free',
      group: raw.group || seatGroups?.[seatId] || null,
    };
  };

  // 🔹 Couleur finale affichée sur le plan
  const getVisualColor = (seatId) => {
    const { status, group } = getSeatInfo(seatId);

    // Priorité à la couleur du groupe si elle existe
    if (group && groupColorMap[group]) {
      return groupColorMap[group];
    }

    // Sinon, couleur selon le statut
    return STATUS_COLORS[status] || STATUS_COLORS.free;
  };

  // petite fonction utilitaire
  const degToRad = (deg) => (deg * Math.PI) / 180;

  // Fonction pour créer un arc SVG (compartiment de balcon)
  const createArcPath = (centerX, centerY, innerRadius, outerRadius, startAngle, endAngle) => {
    const startRad = degToRad(startAngle);
    const endRad = degToRad(endAngle);

    const x1 = centerX + Math.cos(startRad) * innerRadius;
    const y1 = centerY + Math.sin(startRad) * innerRadius;
    const x2 = centerX + Math.cos(endRad) * innerRadius;
    const y2 = centerY + Math.sin(endRad) * innerRadius;
    const x3 = centerX + Math.cos(endRad) * outerRadius;
    const y3 = centerY + Math.sin(endRad) * outerRadius;
    const x4 = centerX + Math.cos(startRad) * outerRadius;
    const y4 = centerY + Math.sin(startRad) * outerRadius;

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1}
            A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${x2} ${y2}
            L ${x3} ${y3}
            A ${outerRadius} ${outerRadius} 0 ${largeArc} 0 ${x4} ${y4}
            Z`;
  };

  return (
    <div style={{
      textAlign: 'center',
      padding: isMobile ? '0.5rem' : '2rem',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{
        marginBottom: isMobile ? '0.75rem' : '1.5rem',
        color: '#d32f2f',
        fontSize: isMobile ? '1.1rem' : '1.8rem',
        fontWeight: '700',
        textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
      }}>
        Plan circulaire (vue globale)
      </h2>

      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${size} ${size}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          maxWidth: '100%',
          maxHeight: isMobile ? '80vh' : '100%',
          height: 'auto',
          background: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          display: 'block',
          margin: '0 auto'
        }}
      >
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="1" result="offsetblur"/>
            <feFlood floodColor="#000000" floodOpacity="0.2"/>
            <feComposite in2="offsetblur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Dégradé pour les compartiments de balcons */}
          <linearGradient id="balconGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7e57c2" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="#7e57c2" stopOpacity="0.12"/>
          </linearGradient>

          {/* Dégradé pour les loges */}
          <linearGradient id="logeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#c2185b" stopOpacity="0.22"/>
            <stop offset="100%" stopColor="#c2185b" stopOpacity="0.1"/>
          </linearGradient>

          {/* Dégradé pour les gradins */}
          <linearGradient id="gradinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#90a4ae" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="#90a4ae" stopOpacity="0.08"/>
          </linearGradient>
        </defs>
        {/* Cercles de guide pour les différentes couches */}
        <circle
          cx={center}
          cy={center}
          r={logeInnerRadius - 3}
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="1"
          opacity="0.3"
        />
        <circle
          cx={center}
          cy={center}
          r={gradinBaseRadius - 3}
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="1"
          opacity="0.3"
        />
        <circle
          cx={center}
          cy={center}
          r={balconBaseRadius - 3}
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="1"
          opacity="0.3"
        />

        {/* Piste centrale */}
        <circle
          cx={center}
          cy={center}
          r={pisteRadius}
          fill="#f4e4c1"
          stroke="#d4a574"
          strokeWidth="2.5"
        />
        <circle
          cx={center}
          cy={center}
          r={pisteRadius - 5}
          fill="none"
          stroke="#d4a574"
          strokeWidth="1"
          opacity="0.3"
        />
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fontWeight="700"
          fill="#8b6914"
        >
          PISTE
        </text>

        {/* Indication "Entrée artistes" en haut */}
        <text
          x={center}
          y={center - size * 0.45}
          textAnchor="middle"
          fontSize="11"
        >
          Entrée artistes
        </text>

        {/* === LOGES (anneau intérieur) === */}
        {logeSectors.map((sector) => {
          const angleCenter = LOGE_CONFIG[sector.label].angle;
          const angleStart = angleCenter - logeAngleSpan / 2;
          const angleEnd = angleCenter + logeAngleSpan / 2;
          const seatsPerRow = sector.rows[0]?.seats || 0;

          // label de loge
          const labelRadius = logeInnerRadius + logeRowSpacing * 2 + 4;
          const labelRad = degToRad(angleCenter);
          const labelX = center + Math.cos(labelRad) * labelRadius;
          const labelY = center + Math.sin(labelRad) * labelRadius;

          // Rayons pour les lignes de séparation et compartiment
          const logeInnerR = logeInnerRadius - 4;
          const logeOuterR = logeInnerRadius + logeRowSpacing * 2 + 5;

          return (
            <g key={sector.id}>
              {/* Compartiment de fond pour la loge */}
              <path
                d={createArcPath(center, center, logeInnerR, logeOuterR, angleStart, angleEnd)}
                fill="url(#logeGradient)"
                stroke="#aa0055"
                strokeWidth="2.5"
                strokeOpacity="0.6"
                style={{ pointerEvents: 'none' }}
              />
              {/* Bordure intérieure pour plus de définition */}
              <path
                d={`M ${center + Math.cos(degToRad(angleStart)) * (logeInnerR + 1)}
                    ${center + Math.sin(degToRad(angleStart)) * (logeInnerR + 1)}
                    A ${logeInnerR + 1} ${logeInnerR + 1} 0
                    ${angleEnd - angleStart > 180 ? 1 : 0} 1
                    ${center + Math.cos(degToRad(angleEnd)) * (logeInnerR + 1)}
                    ${center + Math.sin(degToRad(angleEnd)) * (logeInnerR + 1)}`}
                stroke="#aa0055"
                strokeWidth="0.5"
                opacity="0.3"
                fill="none"
              />

              {/* Lignes de séparation des loges - plus marquées */}
              <line
                x1={center + Math.cos(degToRad(angleStart)) * logeInnerR}
                y1={center + Math.sin(degToRad(angleStart)) * logeInnerR}
                x2={center + Math.cos(degToRad(angleStart)) * logeOuterR}
                y2={center + Math.sin(degToRad(angleStart)) * logeOuterR}
                stroke="#ffffff"
                strokeWidth="3"
                opacity="0.8"
              />
              <line
                x1={center + Math.cos(degToRad(angleStart)) * logeInnerR}
                y1={center + Math.sin(degToRad(angleStart)) * logeInnerR}
                x2={center + Math.cos(degToRad(angleStart)) * logeOuterR}
                y2={center + Math.sin(degToRad(angleStart)) * logeOuterR}
                stroke="#aa0055"
                strokeWidth="2.5"
                opacity="0.8"
              />
              <line
                x1={center + Math.cos(degToRad(angleEnd)) * logeInnerR}
                y1={center + Math.sin(degToRad(angleEnd)) * logeInnerR}
                x2={center + Math.cos(degToRad(angleEnd)) * logeOuterR}
                y2={center + Math.sin(degToRad(angleEnd)) * logeOuterR}
                stroke="#ffffff"
                strokeWidth="3"
                opacity="0.8"
              />
              <line
                x1={center + Math.cos(degToRad(angleEnd)) * logeInnerR}
                y1={center + Math.sin(degToRad(angleEnd)) * logeInnerR}
                x2={center + Math.cos(degToRad(angleEnd)) * logeOuterR}
                y2={center + Math.sin(degToRad(angleEnd)) * logeOuterR}
                stroke="#aa0055"
                strokeWidth="2.5"
                opacity="0.8"
              />

              {/* Ligne de séparation entre les deux rangs */}
              <path
                d={`M ${center + Math.cos(degToRad(angleStart)) * (logeInnerRadius + logeRowSpacing / 2)}
                    ${center + Math.sin(degToRad(angleStart)) * (logeInnerRadius + logeRowSpacing / 2)}
                    A ${logeInnerRadius + logeRowSpacing / 2} ${logeInnerRadius + logeRowSpacing / 2} 0
                    ${angleEnd - angleStart > 180 ? 1 : 0} 1
                    ${center + Math.cos(degToRad(angleEnd)) * (logeInnerRadius + logeRowSpacing / 2)}
                    ${center + Math.sin(degToRad(angleEnd)) * (logeInnerRadius + logeRowSpacing / 2)}`}
                stroke="#aa0055"
                strokeWidth="1.2"
                opacity="0.4"
                fill="none"
              />

              {/* Fond pour le label */}
              <rect
                x={labelX - 8}
                y={labelY - 4}
                width="16"
                height="8"
                rx="4"
                fill="rgba(255, 255, 255, 0.95)"
                stroke="#aa0055"
                strokeWidth="0.5"
                style={{ pointerEvents: 'none' }}
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="5"
                fill="#aa0055"
                fontWeight="700"
                style={{ pointerEvents: 'none' }}
              >
                {sector.label.replace('Loge ', '').replace(' (inutilisable)', '')}
              </text>

              {sector.rows.map((row) => {
                const rowIndex = row.row; // 1 ou 2
                const radius =
                  logeInnerRadius + (rowIndex - 1) * logeRowSpacing;
                const seatsCount = row.seats;

                return (
                  <g key={`${sector.id}-row-${row.row}`}>
                    {[...Array(seatsCount)].map((_, i) => {
                      const seatNum = i + 1;

                      // Meilleure répartition : espacement uniforme avec marges
                      const margin = logeAngleSpan * 0.1; // 10% de marge de chaque côté
                      const usableSpan = logeAngleSpan - (2 * margin);
                      const angle = seatsCount > 1
                        ? angleStart + margin + (i * usableSpan) / (seatsCount - 1)
                        : angleCenter;

                      const rad = degToRad(angle);
                      const x = center + Math.cos(rad) * radius;
                      const y = center + Math.sin(rad) * radius;

                      const seatId = `${sector.id}-${row.row}-${seatNum}`;
                      const fillColor = getVisualColor(seatId);

                      return (
                        <circle
                          key={seatId}
                          cx={x}
                          cy={y}
                          r={3.5}
                          fill={fillColor}
                          stroke="#fff"
                          strokeWidth="1"
                          onClick={() => toggleSeat(seatId)}
                          style={{ cursor: 'pointer' }}
                        />
                      );
                    })}
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* === GRADINS (anneau extérieur) === */}
        {gradinSectors.map((sector) => {
          const { angle: angleCenter, span: sectorSpan } =
            GRADIN_CONFIG[sector.label];
          const angleStart = angleCenter - sectorSpan / 2;
          const angleEnd = angleCenter + sectorSpan / 2;

          // label de secteur
          const maxRowInSector = Math.max(...sector.rows.map((r) => r.row));
          const middleRadius =
            gradinBaseRadius + (maxRowInSector * gradinRowSpacing) / 2;
          const labelRad = degToRad(angleCenter);
          const labelX = center + Math.cos(labelRad) * middleRadius;
          const labelY = center + Math.sin(labelRad) * middleRadius;

          // Rayons pour le compartiment
          const gradinInnerR = gradinBaseRadius;
          const gradinOuterR = gradinBaseRadius + maxRowInSector * gradinRowSpacing + 3;

          return (
            <g key={sector.id}>
              {/* Compartiment de fond pour le gradin */}
              <path
                d={createArcPath(center, center, gradinInnerR, gradinOuterR, angleStart, angleEnd)}
                fill="url(#gradinGradient)"
                stroke="#607d8b"
                strokeWidth="1.5"
                strokeOpacity="0.4"
                style={{ pointerEvents: 'none' }}
              />
              {/* Bordure intérieure pour plus de définition */}
              <path
                d={`M ${center + Math.cos(degToRad(angleStart)) * (gradinInnerR + 1)}
                    ${center + Math.sin(degToRad(angleStart)) * (gradinInnerR + 1)}
                    A ${gradinInnerR + 1} ${gradinInnerR + 1} 0
                    ${sectorSpan > 180 ? 1 : 0} 1
                    ${center + Math.cos(degToRad(angleEnd)) * (gradinInnerR + 1)}
                    ${center + Math.sin(degToRad(angleEnd)) * (gradinInnerR + 1)}`}
                stroke="#607d8b"
                strokeWidth="0.5"
                opacity="0.3"
                fill="none"
              />

              {/* Lignes de séparation des gradins */}
              <line
                x1={center + Math.cos(degToRad(angleStart)) * gradinInnerR}
                y1={center + Math.sin(degToRad(angleStart)) * gradinInnerR}
                x2={center + Math.cos(degToRad(angleStart)) * gradinOuterR}
                y2={center + Math.sin(degToRad(angleStart)) * gradinOuterR}
                stroke="#ffffff"
                strokeWidth="2"
                opacity="0.7"
              />
              <line
                x1={center + Math.cos(degToRad(angleStart)) * gradinInnerR}
                y1={center + Math.sin(degToRad(angleStart)) * gradinInnerR}
                x2={center + Math.cos(degToRad(angleStart)) * gradinOuterR}
                y2={center + Math.sin(degToRad(angleStart)) * gradinOuterR}
                stroke="#607d8b"
                strokeWidth="1.5"
                opacity="0.6"
              />
              <line
                x1={center + Math.cos(degToRad(angleEnd)) * gradinInnerR}
                y1={center + Math.sin(degToRad(angleEnd)) * gradinInnerR}
                x2={center + Math.cos(degToRad(angleEnd)) * gradinOuterR}
                y2={center + Math.sin(degToRad(angleEnd)) * gradinOuterR}
                stroke="#ffffff"
                strokeWidth="2"
                opacity="0.7"
              />
              <line
                x1={center + Math.cos(degToRad(angleEnd)) * gradinInnerR}
                y1={center + Math.sin(degToRad(angleEnd)) * gradinInnerR}
                x2={center + Math.cos(degToRad(angleEnd)) * gradinOuterR}
                y2={center + Math.sin(degToRad(angleEnd)) * gradinOuterR}
                stroke="#607d8b"
                strokeWidth="1.5"
                opacity="0.6"
              />

              {/* Lignes de séparation entre rangs (tous les 2 rangs) */}
              {[...Array(Math.floor(maxRowInSector / 2))].map((_, idx) => {
                const rowNum = (idx + 1) * 2;
                const lineRadius = gradinBaseRadius + rowNum * gradinRowSpacing - gradinRowSpacing / 2;
                return (
                  <path
                    key={`gradin-row-sep-${idx}`}
                    d={`M ${center + Math.cos(degToRad(angleStart)) * lineRadius}
                        ${center + Math.sin(degToRad(angleStart)) * lineRadius}
                        A ${lineRadius} ${lineRadius} 0
                        ${sectorSpan > 180 ? 1 : 0} 1
                        ${center + Math.cos(degToRad(angleEnd)) * lineRadius}
                        ${center + Math.sin(degToRad(angleEnd)) * lineRadius}`}
                    stroke="#607d8b"
                    strokeWidth="0.5"
                    opacity="0.2"
                    fill="none"
                  />
                );
              })}

              {sector.rows.map((row) => {
                const radius = gradinBaseRadius + row.row * gradinRowSpacing;
                const seatsCount = row.seats;

                return (
                  <g key={`${sector.id}-row-${row.row}`}>
                    {[...Array(seatsCount)].map((_, i) => {
                      const seatNum = i + 1;

                      // Meilleure répartition : espacement uniforme avec marges
                      const margin = sectorSpan * 0.05; // 5% de marge de chaque côté
                      const usableSpan = sectorSpan - (2 * margin);
                      const angle = seatsCount > 1
                        ? angleStart + margin + (i * usableSpan) / (seatsCount - 1)
                        : angleCenter;

                      const rad = degToRad(angle);
                      const x = center + Math.cos(rad) * radius;
                      const y = center + Math.sin(rad) * radius;

                      const seatId = `${sector.id}-${row.row}-${seatNum}`;
                      const fillColor = getVisualColor(seatId);

                      return (
                        <circle
                          key={seatId}
                          cx={x}
                          cy={y}
                          r={3}
                          fill={fillColor}
                          stroke="#fff"
                          strokeWidth="0.8"
                          onClick={() => toggleSeat(seatId)}
                          style={{ cursor: 'pointer' }}
                        />
                      );
                    })}
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* === BALCONS (anneau le plus extérieur) === */}
        {balconSectors.map((sector) => {
          const { angle: angleCenter, span: balconSpan } =
            BALCON_CONFIG[sector.label];
          const angleStart = angleCenter - balconAngleSpan / 2;
          const angleEnd = angleCenter + balconAngleSpan / 2;

          // Rayons pour les lignes de séparation et compartiment
          const balconInnerR = balconBaseRadius - 3;
          const balconOuterR = balconBaseRadius + balconRowSpacing * 2 + 3;

          return (
            <g key={sector.id}>
              {/* Compartiment de fond pour le balcon */}
              <path
                d={createArcPath(center, center, balconInnerR, balconOuterR, angleStart, angleEnd)}
                fill="url(#balconGradient)"
                stroke="#5e35b1"
                strokeWidth="1.5"
                strokeOpacity="0.5"
                style={{ pointerEvents: 'none' }}
              />
              {/* Bordure intérieure pour plus de définition */}
              <path
                d={`M ${center + Math.cos(degToRad(angleStart)) * (balconInnerR + 1)}
                    ${center + Math.sin(degToRad(angleStart)) * (balconInnerR + 1)}
                    A ${balconInnerR + 1} ${balconInnerR + 1} 0
                    ${angleEnd - angleStart > 180 ? 1 : 0} 1
                    ${center + Math.cos(degToRad(angleEnd)) * (balconInnerR + 1)}
                    ${center + Math.sin(degToRad(angleEnd)) * (balconInnerR + 1)}`}
                stroke="#5e35b1"
                strokeWidth="0.5"
                opacity="0.3"
                fill="none"
              />

              {/* Lignes de séparation des balcons - plus marquées */}
              <line
                x1={center + Math.cos(degToRad(angleStart)) * balconInnerR}
                y1={center + Math.sin(degToRad(angleStart)) * balconInnerR}
                x2={center + Math.cos(degToRad(angleStart)) * balconOuterR}
                y2={center + Math.sin(degToRad(angleStart)) * balconOuterR}
                stroke="#ffffff"
                strokeWidth="2"
                opacity="0.7"
              />
              <line
                x1={center + Math.cos(degToRad(angleStart)) * balconInnerR}
                y1={center + Math.sin(degToRad(angleStart)) * balconInnerR}
                x2={center + Math.cos(degToRad(angleStart)) * balconOuterR}
                y2={center + Math.sin(degToRad(angleStart)) * balconOuterR}
                stroke="#5e35b1"
                strokeWidth="1.5"
                opacity="0.7"
              />
              <line
                x1={center + Math.cos(degToRad(angleEnd)) * balconInnerR}
                y1={center + Math.sin(degToRad(angleEnd)) * balconInnerR}
                x2={center + Math.cos(degToRad(angleEnd)) * balconOuterR}
                y2={center + Math.sin(degToRad(angleEnd)) * balconOuterR}
                stroke="#ffffff"
                strokeWidth="2"
                opacity="0.7"
              />
              <line
                x1={center + Math.cos(degToRad(angleEnd)) * balconInnerR}
                y1={center + Math.sin(degToRad(angleEnd)) * balconInnerR}
                x2={center + Math.cos(degToRad(angleEnd)) * balconOuterR}
                y2={center + Math.sin(degToRad(angleEnd)) * balconOuterR}
                stroke="#5e35b1"
                strokeWidth="1.5"
                opacity="0.7"
              />

              {/* Lignes de séparation entre les deux rangs */}
              <path
                d={`M ${center + Math.cos(degToRad(angleStart)) * (balconBaseRadius + balconRowSpacing / 2)}
                    ${center + Math.sin(degToRad(angleStart)) * (balconBaseRadius + balconRowSpacing / 2)}
                    A ${balconBaseRadius + balconRowSpacing / 2} ${balconBaseRadius + balconRowSpacing / 2} 0
                    ${angleEnd - angleStart > 180 ? 1 : 0} 1
                    ${center + Math.cos(degToRad(angleEnd)) * (balconBaseRadius + balconRowSpacing / 2)}
                    ${center + Math.sin(degToRad(angleEnd)) * (balconBaseRadius + balconRowSpacing / 2)}`}
                stroke="#5e35b1"
                strokeWidth="0.8"
                opacity="0.3"
                fill="none"
              />

              {sector.rows.map((row) => {
                const rowIndex = row.row;
                const radius =
                  balconBaseRadius + (rowIndex - 1) * balconRowSpacing;
                const seatsCount = row.seats;

                return (
                  <g key={`${sector.id}-row-${row.row}`}>
                    {[...Array(seatsCount)].map((_, i) => {
                      const seatNum = i + 1;

                      // Meilleure répartition : espacement uniforme avec marges
                      const margin = balconAngleSpan * 0.15; // 15% de marge de chaque côté
                      const usableSpan = balconAngleSpan - (2 * margin);
                      const angle = seatsCount > 1
                        ? angleStart + margin + (i * usableSpan) / (seatsCount - 1)
                        : angleCenter;

                      const rad = degToRad(angle);
                      const x = center + Math.cos(rad) * radius;
                      const y = center + Math.sin(rad) * radius;

                      const seatId = `${sector.id}-${row.row}-${seatNum}`;
                      const fillColor = getVisualColor(seatId);

                      return (
                        <circle
                          key={seatId}
                          cx={x}
                          cy={y}
                          r={2.8}
                          fill={fillColor}
                          stroke="#fff"
                          strokeWidth="0.8"
                          onClick={() => toggleSeat(seatId)}
                          style={{ cursor: 'pointer' }}
                          filter="url(#shadow)"
                        />
                      );
                    })}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Légende */}
      <div style={{
        marginTop: '1.5rem',
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        flexWrap: 'wrap',
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: STATUS_COLORS.free,
            border: '2px solid #fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
          }} />
          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Libre</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: STATUS_COLORS.reserved,
            border: '2px solid #fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
          }} />
          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Réservée</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: STATUS_COLORS.occupied,
            border: '2px solid #fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
          }} />
          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Occupée</span>
        </div>
      </div>
    </div>
  );
}
