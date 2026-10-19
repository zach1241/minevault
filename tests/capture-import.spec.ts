import { test, expect } from '@playwright/test';
import { parseCaptureManifest } from '../lib/capture-import';

const good = {
  schema: 'minevault.capture.v1',
  event_id: 'demo-0001',
  advancement_id: 'minecraft:story/mine_diamond',
  title: 'Diamonds!',
  occurred_at: '2026-10-19T10:15:22Z',
  captured_at: '2026-10-19T10:15:25Z',
  player_name: 'Alex',
  world: 'Singleplayer',
  dimension: 'minecraft:overworld',
  x: 42, y: -58, z: 120,
  minecraft_day: 5,
  perspective: 'FIRST_PERSON',
  players_online: ['Alex', 'Jade'],
  screenshot: 'demo-0001.png',
};

test('imports achievements with event timestamp and multiplayer context', () => {
  const entry = parseCaptureManifest(good);
  expect(entry.title).toBe('Diamonds!');
  expect(entry.entry_type).toBe('Achievement');
  expect(entry.occurred_on).toBe('2026-10-19');
  expect([entry.x, entry.y, entry.z]).toEqual([42, -58, 120]);
  expect(entry.description).toContain('Alex, Jade');
  expect(entry.description).toContain('2026-10-19T10:15:22.000Z');
});

test('rejects unrelated and malformed manifests', () => {
  expect(() => parseCaptureManifest({schema: 'unknown'})).toThrow();
  expect(() => parseCaptureManifest({...good, x: 'hi'})).toThrow();
  expect(() => parseCaptureManifest({...good, occurred_at: 'invalid'})).toThrow();
  expect(() => parseCaptureManifest({...good, minecraft_day: -4})).toThrow();
});

test('trims player data to protect field limits', () => {
  const entry = parseCaptureManifest({...good, title: ' Diamonds! ', players_online: ['\u0000Alex', 'Jade']});
  expect(entry.title).toBe('Diamonds!');
  expect(entry.description).not.toContain('\u0000');
});
