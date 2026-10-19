import type { EntryInput } from './types';

type Capture = {
  schema: 'minevault.capture.v1';
  event_id: string;
  advancement_id: string;
  title: string;
  occurred_at: string;
  captured_at: string;
  player_name: string;
  world: string;
  dimension: string;
  x: number;
  y: number;
  z: number;
  minecraft_day: number;
  perspective: string;
  players_online: string[];
  screenshot: string;
};

export function parseCaptureManifest(input: unknown): EntryInput {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('This file is not a MineVault capture.');
  }
  const data = input as Partial<Capture>;
  if (data.schema !== 'minevault.capture.v1') {
    throw new Error('Unsupported capture format. Use a file exported by the MineVault mod.');
  }
  if (typeof data.title !== 'string' || !data.title.trim() || data.title.length > 160) {
    throw new Error('The capture is missing a valid achievement title.');
  }
  if (typeof data.occurred_at !== 'string' || !Number.isFinite(Date.parse(data.occurred_at))) {
    throw new Error('The capture is missing a valid event timestamp.');
  }
  const date = new Date(data.occurred_at);
  if (date.getUTCFullYear() < 2000 || date.getUTCFullYear() > 2100) {
    throw new Error('The capture date is outside the supported range.');
  }
  const coords = [data.x, data.y, data.z];
  if (!coords.every(x => Number.isSafeInteger(x) && Math.abs(x as number) <= 30_000_000)) {
    throw new Error('The capture has invalid XYZ coordinates.');
  }
  if (!Number.isSafeInteger(data.minecraft_day) || (data.minecraft_day as number) < 0) {
    throw new Error('The capture has an invalid Minecraft day.');
  }
  const clean = (s: unknown, max = 160) =>
    typeof s === 'string' ? s.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max) : '';
  const players = Array.isArray(data.players_online)
    ? data.players_online.slice(0, 100).map(p => clean(p, 32)).filter(Boolean)
    : [];
  const lines = [
    'Imported from MineVault for Minecraft Java Edition.',
    'Event time (UTC): ' + date.toISOString(),
    'Screenshot time (UTC): ' +
      (typeof data.captured_at === 'string' && Number.isFinite(Date.parse(data.captured_at))
        ? new Date(data.captured_at).toISOString() : 'Not available'),
    'Player: ' + (clean(data.player_name, 32) || 'Unknown'),
    'World: ' + (clean(data.world, 160) || 'Unknown'),
    'Dimension: ' + (clean(data.dimension, 100) || 'Unknown'),
    'Perspective: ' + (clean(data.perspective, 32) || 'Unknown'),
    'Advancement ID: ' + clean(data.advancement_id, 160),
    'Players online at event: ' + (players.length ? players.join(', ') : 'Unavailable'),
    'Capture ID: ' + clean(data.event_id, 100),
  ];
  return {
    title: data.title.trim(),
    entry_type: 'Achievement',
    occurred_on: date.toISOString().slice(0, 10),
    description: lines.join('\n'),
    minecraft_day: data.minecraft_day as number,
    location_name: clean(data.dimension, 100),
    x: data.x as number,
    y: data.y as number,
    z: data.z as number,
  };
}
