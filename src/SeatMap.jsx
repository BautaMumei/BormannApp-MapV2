import React, { useState, useEffect } from 'react';
import { sectors, TOTAL_BALCON, TOTAL_LOGES, TOTAL_GRADIN } from './seats';
import CircularSeatMap from './CircularSeatMap';
import { supabase } from './supabaseClient';

const gradinSectors = sectors.filter((s) => s.type === 'gradin' || !s.type);
const logeSectors = sectors.filter((s) => s.type === 'loge');
const balconSectors = sectors.filter((s) => s.type === 'balcon');

const STATUS_COLORS = {
  free: '#81c784',
  reserved: '#ffb74d',
  occupied: '#e57373',
};

const STATUS_LABELS = {
  free: 'Libre',
  reserved: 'Réservé',
  occupied: 'Occupé',
};

function getNextStatus(current) {
  if (current === 'free') return 'reserved';
  if (current === 'reserved') return 'occupied';
  return 'free';
}

const GROUP_PALETTE = [
  '#e91e63',
  '#2196f3',
  '#1a237e',
  '#ff9800',
  '#9c27b0',
  '#009688',
  '#795548',
  '#3f51b5',
];

export default function SeatMap() {
  const [viewType, setViewType] = useState('gradin');
  const [selectedSectorId, setSelectedSectorId] = useState(gradinSectors[0]?.id);
  const [selectedLogeId, setSelectedLogeId] = useState(logeSectors[0]?.id);
  const [selectedBalconId, setSelectedBalconId] = useState(balconSectors[0]?.id);

  const [seatStates, setSeatStates] = useState({});
  const [seatGroups, setSeatGroups] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const [groupRow, setGroupRow] = useState(1);
  const [groupSize, setGroupSize] = useState(1);
  const [groupStartSeat, setGroupStartSeat] = useState('');
  const [groupLabel, setGroupLabel] = useState('');

  const [isDragging, setIsDragging] = useState(false);
  const [dragStatus, setDragStatus] = useState(null);
  const [dragSectorRow, setDragSectorRow] = useState(null);
  const [isMouse, setIsMouse] = useState(true);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [touchStart, setTouchStart] = useState(null);
  const [touchMove, setTouchMove] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      setIsMouse(e.pointerType === 'mouse');
    };
    window.addEventListener('pointerdown', handler);
    return () => window.removeEventListener('pointerdown', handler);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadSeatsFromDatabase();

    const subscription = supabase
      .channel('seat_reservations_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seat_reservations' }, () => {
        loadSeatsFromDatabase();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadSeatsFromDatabase = async () => {
    try {
      const { data, error } = await supabase
        .from('seat_reservations')
        .select('seat_id, status, group_name');

      if (error) throw error;

      const states = {};
      const groups = {};

      data.forEach((seat) => {
        states[seat.seat_id] = seat.status;
        if (seat.group_name) {
          groups[seat.seat_id] = seat.group_name;
        }
      });

      setSeatStates(states);
      setSeatGroups(groups);
    } catch (error) {
      console.error('Erreur lors du chargement des sièges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSeatInDatabase = async (seatId, status, groupName = null) => {
    try {
      const { error } = await supabase
        .from('seat_reservations')
        .upsert({
          seat_id: seatId,
          status: status,
          group_name: groupName,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'seat_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du siège:', error);
    }
  };

  const deleteSeatFromDatabase = async (seatId) => {
    try {
      const { error } = await supabase
        .from('seat_reservations')
        .delete()
        .eq('seat_id', seatId);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la suppression du siège:', error);
    }
  };

  useEffect(() => {
    const handlePointerUp = () => {
      setIsDragging(false);
      setDragStatus(null);
      setDragSectorRow(null);
    };

    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  let selectedSector;
  if (viewType === 'gradin') {
    selectedSector = gradinSectors.find((s) => s.id === selectedSectorId) || gradinSectors[0];
  } else if (viewType === 'loge') {
    selectedSector = logeSectors.find((s) => s.id === selectedLogeId) || logeSectors[0];
  } else {
    selectedSector = balconSectors.find((s) => s.id === selectedBalconId) || balconSectors[0];
  }

  useEffect(() => {
    if (!selectedSector) return;
    const rowNumbers = selectedSector.rows.map((r) => r.row);
    if (!rowNumbers.includes(groupRow)) {
      setGroupRow(rowNumbers[0]);
    }
  }, [selectedSector, groupRow]);

  const getSeatStatus = (seatId) => {
    return seatStates[seatId] || 'free';
  };

  const toggleSeat = (seatId) => {
    const currentStatus = getSeatStatus(seatId);
    const nextStatus = getNextStatus(currentStatus);

    setSeatStates((prev) => ({
      ...prev,
      [seatId]: nextStatus,
    }));

    if (nextStatus === 'free') {
      setSeatGroups((prev) => {
        const updated = { ...prev };
        delete updated[seatId];
        return updated;
      });
      deleteSeatFromDatabase(seatId);
    } else {
      const groupName = seatGroups[seatId] || null;
      updateSeatInDatabase(seatId, nextStatus, groupName);
    }
  };

  const handleSeatPointerDown = (seatId, sectorId, row, event) => {
    if (event?.preventDefault) event.preventDefault();

    if (!isMouse) {
      setTouchStart({
        x: event.clientX || event.touches?.[0]?.clientX,
        y: event.clientY || event.touches?.[0]?.clientY,
        seatId,
      });
      setTouchMove(null);
      return;
    }

    const current = getSeatStatus(seatId);
    const next = getNextStatus(current);

    toggleSeat(seatId);

    if (isMouse) {
      setIsDragging(true);
      setDragStatus(next);
      setDragSectorRow({ sectorId, row });
    }
  };

  const handleSeatPointerMove = (seatId, sectorId, row, event) => {
    if (!isMouse) {
      if (touchStart) {
        setTouchMove({
          x: event.clientX || event.touches?.[0]?.clientX,
          y: event.clientY || event.touches?.[0]?.clientY,
        });
      }
      return;
    }

    if (!isDragging || !dragStatus || !dragSectorRow) return;

    if (dragSectorRow.sectorId !== sectorId || dragSectorRow.row !== row) {
      return;
    }

    if (event?.preventDefault) event.preventDefault();

    const current = getSeatStatus(seatId);
    if (current !== dragStatus) {
      setSeatStates((prev) => ({ ...prev, [seatId]: dragStatus }));

      if (dragStatus === 'free') {
        setSeatGroups((prev) => {
          const updated = { ...prev };
          delete updated[seatId];
          return updated;
        });
        deleteSeatFromDatabase(seatId);
      } else {
        const groupName = seatGroups[seatId] || null;
        updateSeatInDatabase(seatId, dragStatus, groupName);
      }
    }
  };

  const handleSeatPointerUp = (seatId) => {
    if (!isMouse && touchStart) {
      const minSwipeDistance = 10;

      if (!touchMove) {
        toggleSeat(seatId);
      } else {
        const distanceX = Math.abs(touchStart.x - touchMove.x);
        const distanceY = Math.abs(touchStart.y - touchMove.y);
        const isSwipe = distanceX > minSwipeDistance || distanceY > minSwipeDistance;

        if (!isSwipe && touchStart.seatId === seatId) {
          toggleSeat(seatId);
        }
      }

      setTouchStart(null);
      setTouchMove(null);
    }
  };

  const reserveGroupInCurrentSectorRow = async () => {
    const sector = selectedSector;
    if (!sector) return;

    const count = Number(groupSize);
    if (!count || count <= 0) {
      alert('Nombre de places invalide.');
      return;
    }

    const startRowNumber = Number(groupRow);
    const rowsSorted = sector.rows.slice().sort((a, b) => a.row - b.row);
    const foundIndex = rowsSorted.findIndex((r) => r.row === startRowNumber);
    const startRowIndex = foundIndex !== -1 ? foundIndex : 0;

    const rowObj = rowsSorted[startRowIndex];
    if (!rowObj) {
      alert("Ce rang n'existe pas dans ce secteur.");
      return;
    }

    if (count <= rowObj.seats) {
      let startIndex = null;
      const startSeatStr = String(groupStartSeat).trim();

      if (startSeatStr !== '') {
        const start = Number(startSeatStr);
        if (!start || start < 1) {
          alert('Place de départ invalide');
          return;
        }
        const last = start + count - 1;
        if (last > rowObj.seats) {
          alert(`Pas assez de sièges à partir de la place ${start}.`);
          return;
        }

        let free = true;
        for (let j = 0; j < count; j++) {
          if (getSeatStatus(`${sector.id}-${rowObj.row}-${start + j}`) !== 'free') {
            free = false;
            break;
          }
        }
        if (!free) {
          alert('Les places ne sont pas toutes libres sur ce bloc.');
          return;
        }
        startIndex = start;
      } else {
        const maxStart = rowObj.seats - count + 1;
        for (let i = 1; i <= maxStart; i++) {
          let ok = true;
          for (let j = 0; j < count; j++) {
            if (getSeatStatus(`${sector.id}-${rowObj.row}-${i + j}`) !== 'free') {
              ok = false;
              break;
            }
          }
          if (ok) {
            startIndex = i;
            break;
          }
        }
        if (startIndex === null) {
          alert('Aucun bloc libre consécutif suffisant sur ce rang.');
          return;
        }
      }

      const seatIdsForGroup = [];
      for (let j = 0; j < count; j++) {
        seatIdsForGroup.push(`${sector.id}-${rowObj.row}-${startIndex + j}`);
      }

      setSeatStates((prev) => {
        const updated = { ...prev };
        seatIdsForGroup.forEach((id) => {
          updated[id] = 'reserved';
        });
        return updated;
      });

      if (groupLabel) {
        setSeatGroups((prev) => {
          const updated = { ...prev };
          seatIdsForGroup.forEach((id) => {
            updated[id] = groupLabel;
          });
          return updated;
        });
      }

      for (const seatId of seatIdsForGroup) {
        await updateSeatInDatabase(seatId, 'reserved', groupLabel || null);
      }

      return;
    }

    let totalFree = 0;
    for (const row of rowsSorted) {
      for (let seatNum = 1; seatNum <= row.seats; seatNum++) {
        const seatId = `${sector.id}-${row.row}-${seatNum}`;
        if (getSeatStatus(seatId) === 'free') totalFree++;
      }
    }
    if (totalFree < count) {
      alert(`Pas assez de places libres dans ce secteur pour ${count} personnes. (Places libres : ${totalFree})`);
      return;
    }

    const seatsToReserve = [];
    let remaining = count;

    for (let idx = startRowIndex; idx < rowsSorted.length && remaining > 0; idx++) {
      const row = rowsSorted[idx];
      const freeSeatNums = [];
      for (let seatNum = 1; seatNum <= row.seats; seatNum++) {
        const seatId = `${sector.id}-${row.row}-${seatNum}`;
        if (getSeatStatus(seatId) === 'free') {
          freeSeatNums.push(seatNum);
        }
      }

      if (!freeSeatNums.length) continue;

      const canTake = Math.min(remaining, freeSeatNums.length);
      for (let k = 0; k < canTake; k++) {
        const seatNum = freeSeatNums[k];
        seatsToReserve.push({ row: row.row, seatNum });
        remaining--;
        if (remaining === 0) break;
      }
    }

    if (remaining > 0) {
      alert('Impossible de trouver suffisamment de places libres.');
      return;
    }

    const seatIdsForGroup = seatsToReserve.map((s) => `${sector.id}-${s.row}-${s.seatNum}`);

    setSeatStates((prev) => {
      const updated = { ...prev };
      seatIdsForGroup.forEach((id) => {
        updated[id] = 'reserved';
      });
      return updated;
    });

    if (groupLabel) {
      setSeatGroups((prev) => {
        const updated = { ...prev };
        seatIdsForGroup.forEach((id) => {
          updated[id] = groupLabel;
        });
        return updated;
      });
    }

    for (const seatId of seatIdsForGroup) {
      await updateSeatInDatabase(seatId, 'reserved', groupLabel || null);
    }
  };

  const clearGroup = async (groupName) => {
    if (!window.confirm(`Supprimer le groupe "${groupName}" et libérer toutes ses places ?`)) {
      return;
    }

    const seatIdsForGroup = Object.keys(seatGroups).filter(
      (seatId) => seatGroups[seatId] === groupName
    );

    setSeatStates((prev) => {
      const updated = { ...prev };
      seatIdsForGroup.forEach((id) => {
        delete updated[id];
      });
      return updated;
    });

    setSeatGroups((prev) => {
      const updated = { ...prev };
      seatIdsForGroup.forEach((id) => {
        delete updated[id];
      });
      return updated;
    });

    for (const seatId of seatIdsForGroup) {
      await deleteSeatFromDatabase(seatId);
    }
  };

  const renameGroup = async (oldName) => {
    const newName = window.prompt('Nouveau nom du groupe :', oldName);
    if (!newName) return;
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return;

    setSeatGroups((prev) => {
      const updated = {};
      Object.entries(prev).forEach(([seatId, name]) => {
        updated[seatId] = name === oldName ? trimmed : name;
      });
      return updated;
    });

    const seatIdsForGroup = Object.keys(seatGroups).filter(
      (seatId) => seatGroups[seatId] === oldName
    );

    for (const seatId of seatIdsForGroup) {
      const status = getSeatStatus(seatId);
      await updateSeatInDatabase(seatId, status, trimmed);
    }
  };

  const resizeGroup = async (groupName) => {
    const seatIdsForGroup = Object.keys(seatGroups).filter(
      (seatId) => seatGroups[seatId] === groupName
    );
    const currentCount = seatIdsForGroup.length;

    if (currentCount === 0) {
      alert('Ce groupe ne contient actuellement aucune place.');
      return;
    }

    const input = window.prompt(
      `Nombre actuel de places pour "${groupName}" : ${currentCount}\nNouveau nombre souhaité :`,
      String(currentCount)
    );
    if (input === null) return;
    const newCount = Number(input);
    if (!Number.isFinite(newCount) || newCount <= 0) {
      alert('Nombre invalide.');
      return;
    }
    if (newCount === currentCount) return;

    const parseSeatId = (seatId) => {
      const parts = seatId.split('-');
      const seatNum = Number(parts.pop());
      const row = Number(parts.pop());
      const sectorId = parts.join('-');
      return { sectorId, row, seatNum };
    };

    const firstParsed = parseSeatId(seatIdsForGroup[0]);
    const sector = sectors.find((s) => s.id === firstParsed.sectorId);
    if (!sector) {
      alert("Impossible d'identifier le secteur de ce groupe.");
      return;
    }

    if (newCount < currentCount) {
      const sortedSeatIds = [...seatIdsForGroup].sort((a, b) => {
        const A = parseSeatId(a);
        const B = parseSeatId(b);
        if (A.row !== B.row) return A.row - B.row;
        return A.seatNum - B.seatNum;
      });

      const toKeep = sortedSeatIds.slice(0, newCount);
      const toFree = sortedSeatIds.slice(newCount);

      setSeatStates((prev) => {
        const updated = { ...prev };
        toFree.forEach((id) => {
          delete updated[id];
        });
        return updated;
      });

      setSeatGroups((prev) => {
        const updated = { ...prev };
        toFree.forEach((id) => {
          delete updated[id];
        });
        return updated;
      });

      for (const seatId of toFree) {
        await deleteSeatFromDatabase(seatId);
      }

      return;
    }

    const needed = newCount - currentCount;
    let remaining = needed;
    const extraSeatIds = [];

    const rowsSorted = sector.rows.slice().sort((a, b) => a.row - b.row);
    for (const row of rowsSorted) {
      for (let seatNum = 1; seatNum <= row.seats; seatNum++) {
        if (remaining <= 0) break;

        const seatId = `${sector.id}-${row.row}-${seatNum}`;
        if (seatGroups[seatId] === groupName) continue;

        const status = getSeatStatus(seatId);
        if (status !== 'free') continue;

        extraSeatIds.push(seatId);
        remaining -= 1;
        if (remaining <= 0) break;
      }
    }

    if (remaining > 0) {
      alert(`Pas assez de places libres dans ce secteur pour atteindre ${newCount} places.`);
      return;
    }

    setSeatStates((prev) => {
      const updated = { ...prev };
      extraSeatIds.forEach((id) => {
        updated[id] = 'reserved';
      });
      return updated;
    });

    setSeatGroups((prev) => {
      const updated = { ...prev };
      extraSeatIds.forEach((id) => {
        updated[id] = groupName;
      });
      return updated;
    });

    for (const seatId of extraSeatIds) {
      await updateSeatInDatabase(seatId, 'reserved', groupName);
    }
  };

  const resetAllSeats = async () => {
    if (window.confirm("Remettre toutes les places en 'Libre' ?")) {
      setSeatStates({});
      setSeatGroups({});

      try {
        const { error } = await supabase
          .from('seat_reservations')
          .delete()
          .neq('seat_id', '');

        if (error) throw error;
      } catch (error) {
        console.error('Erreur lors de la réinitialisation:', error);
      }
    }
  };

  const groupNames = Array.from(
    new Set(
      Object.keys(seatGroups)
        .filter((seatId) => getSeatStatus(seatId) !== 'free' && seatGroups[seatId])
        .map((seatId) => seatGroups[seatId])
    )
  );

  const groupColorMap = {};
  groupNames.forEach((g, index) => {
    groupColorMap[g] = GROUP_PALETTE[index % GROUP_PALETTE.length];
  });

  const totalSeats = TOTAL_GRADIN + TOTAL_LOGES + TOTAL_BALCON;
  const freeCount = Object.values(seatStates).filter(s => s === 'free').length;
  const reservedCount = Object.values(seatStates).filter(s => s === 'reserved').length;
  const occupiedCount = Object.values(seatStates).filter(s => s === 'occupied').length;
  const totalReservedOrOccupied = reservedCount + occupiedCount;
  const actualFreeCount = totalSeats - totalReservedOrOccupied;

  if (!selectedSector) return null;

  if (isLoading) {
    return (
      <div className="container">
        <h1 style={{ textAlign: 'center' }}>Plan du Cirque</h1>
        <p className="subtitle" style={{ textAlign: 'center' }}>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ userSelect: 'none' }}>
      <h1 style={{ textAlign: 'center' }}>Plan du Cirque</h1>
      <p className="subtitle" style={{ textAlign: 'center' }}>
        Système de gestion des places en temps réel
      </p>

      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeft: '4px solid #81c784' }}>
          <div className="stat-label">Places Libres</div>
          <div className="stat-value">{actualFreeCount}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #ffb74d' }}>
          <div className="stat-label">Réservées</div>
          <div className="stat-value">{reservedCount}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #e57373' }}>
          <div className="stat-label">Occupées</div>
          <div className="stat-value">{occupiedCount}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #2196f3' }}>
          <div className="stat-label">Total</div>
          <div className="stat-value">{totalSeats}</div>
        </div>
      </div>

      <div className="tab-switch">
        {[
          { id: 'gradin', label: 'Gradins' },
          { id: 'loge', label: 'Loges' },
          { id: 'balcon', label: 'Balcons' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setViewType(t.id)}
            className={'btn tab-btn ' + (viewType === t.id ? 'tab-btn--active' : '')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {viewType === 'gradin' && (
        <div className="sector-buttons">
          {gradinSectors.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSectorId(s.id)}
              className={'btn sector-btn ' + (s.id === selectedSectorId ? 'sector-btn--active' : '')}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {viewType === 'loge' && (
        <div className="form-group" style={{ maxWidth: '400px', margin: '0 auto 1.5rem' }}>
          <label className="form-label">
            Sélectionner une loge
            <select
              className="form-select"
              value={selectedLogeId || ''}
              onChange={(e) => setSelectedLogeId(e.target.value)}
            >
              {logeSectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {viewType === 'balcon' && (
        <div className="form-group" style={{ maxWidth: '400px', margin: '0 auto 1.5rem' }}>
          <label className="form-label">
            Sélectionner un balcon
            <select
              className="form-select"
              value={selectedBalconId || ''}
              onChange={(e) => setSelectedBalconId(e.target.value)}
            >
              {balconSectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="reservation-panel">
        <h3>Réserver un groupe</h3>
        <div className="form-inline">
          <div className="form-group">
            <label className="form-label">
              Rang
              <select
                className="form-select"
                value={groupRow}
                onChange={(e) => setGroupRow(Number(e.target.value))}
              >
                {selectedSector.rows
                  .slice()
                  .sort((a, b) => a.row - b.row)
                  .map((row) => (
                    <option key={row.row} value={row.row}>
                      {row.row}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">
              Place de départ
              <input
                className="form-input"
                type="number"
                min="1"
                value={groupStartSeat}
                onChange={(e) => setGroupStartSeat(e.target.value)}
                placeholder="Auto"
              />
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">
              Nombre
              <input
                className="form-input"
                type="number"
                min="1"
                value={groupSize}
                onChange={(e) => setGroupSize(Number(e.target.value))}
              />
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">
              Nom du groupe
              <input
                className="form-input"
                type="text"
                value={groupLabel}
                onChange={(e) => setGroupLabel(e.target.value)}
                placeholder="Ex: Groupe A"
              />
            </label>
          </div>

          <div className="form-group">
            <button onClick={reserveGroupInCurrentSectorRow} className="btn btn-success">
              Réserver
            </button>
          </div>
        </div>
        <p className="info-text">
          Laissez "Place de départ" vide pour choisir automatiquement le premier bloc libre.
        </p>
      </div>

      <div className="circular-map-container">
        <CircularSeatMap
          seatStates={seatStates}
          toggleSeat={toggleSeat}
          seatGroups={seatGroups}
          groupColorMap={groupColorMap}
        />
      </div>

      <div className="card">
        <div className="card-header">
          <h2>{selectedSector.label}</h2>
          <button onClick={resetAllSeats} className="btn btn-danger">
            Réinitialiser tout
          </button>
        </div>

        {isMobile && (
          <p className="info-text" style={{ marginBottom: '1rem', marginTop: '0' }}>
            Faites glisser horizontalement pour voir toutes les places
          </p>
        )}

        {selectedSector.rows
          .slice()
          .sort((a, b) => b.row - a.row)
          .map((row) => (
            <div key={row.row} className="seat-row">
              <span className="seat-row-label">Rang {row.row}</span>
              {[...Array(row.seats)].map((_, i) => {
                const seatNum = i + 1;
                const seatId = `${selectedSector.id}-${row.row}-${seatNum}`;
                const status = getSeatStatus(seatId);
                const groupName = status === 'free' ? null : seatGroups[seatId] || null;
                const borderColor = groupName ? groupColorMap[groupName] || '#333' : undefined;

                return (
                  <button
                    key={seatId}
                    onPointerDown={(e) =>
                      handleSeatPointerDown(seatId, selectedSector.id, row.row, e)
                    }
                    onPointerMove={(e) =>
                      handleSeatPointerMove(seatId, selectedSector.id, row.row, e)
                    }
                    onPointerUp={() => handleSeatPointerUp(seatId)}
                    className={`seat-button seat-${status}`}
                    style={borderColor ? { borderColor, borderWidth: '3px' } : {}}
                  >
                    {seatNum}
                  </button>
                );
              })}
            </div>
          ))}
      </div>

      <div className="card">
        {isMobile ? (
          <>
            <div
              className="legend-collapsible"
              onClick={() => setIsLegendOpen(!isLegendOpen)}
            >
              <span>Légende & Groupes</span>
              <span className={`legend-collapsible-icon ${isLegendOpen ? 'open' : ''}`}>
                ▼
              </span>
            </div>
            {isLegendOpen && (
              <>
                <div className="legend" style={{ marginBottom: '1rem' }}>
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <div key={key} className="legend-item">
                      <span className="legend-color" style={{ background: STATUS_COLORS[key] }} />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>

                {groupNames.length > 0 && (
                  <div className="groups-list">
                    {groupNames.map((g) => {
                      const seatsForGroup = Object.keys(seatGroups).filter(
                        (seatId) => seatGroups[seatId] === g && getSeatStatus(seatId) !== 'free'
                      );

                      return (
                        <div key={g} className="group-item">
                          <span
                            className="group-color-badge"
                            style={{ background: groupColorMap[g] || '#000' }}
                          />
                          <span className="group-name">{g}</span>
                          <span className="group-count">({seatsForGroup.length} sièges)</span>

                          <div className="group-actions">
                            <button onClick={() => resizeGroup(g)} className="btn btn-success">
                              Modifier nb
                            </button>
                            <button onClick={() => renameGroup(g)} className="btn btn-primary">
                              Renommer
                            </button>
                            <button onClick={() => clearGroup(g)} className="btn btn-danger">
                              Supprimer
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <h3>Légende</h3>
            <div className="legend">
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <div key={key} className="legend-item">
                  <span className="legend-color" style={{ background: STATUS_COLORS[key] }} />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {groupNames.length > 0 && (
              <>
                <h3>Groupes</h3>
                <div className="groups-list">
                  {groupNames.map((g) => {
                    const seatsForGroup = Object.keys(seatGroups).filter(
                      (seatId) => seatGroups[seatId] === g && getSeatStatus(seatId) !== 'free'
                    );

                    return (
                      <div key={g} className="group-item">
                        <span
                          className="group-color-badge"
                          style={{ background: groupColorMap[g] || '#000' }}
                        />
                        <span className="group-name">{g}</span>
                        <span className="group-count">({seatsForGroup.length} sièges)</span>

                        <div className="group-actions">
                          <button onClick={() => resizeGroup(g)} className="btn btn-success">
                            Modifier nb
                          </button>
                          <button onClick={() => renameGroup(g)} className="btn btn-primary">
                            Renommer
                          </button>
                          <button onClick={() => clearGroup(g)} className="btn btn-danger">
                            Supprimer
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
