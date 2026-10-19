import {test,expect} from '@playwright/test';

test('capture manifest fills the live Add Memory form', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button',{name:'Open journal',exact:true}).click();
  await page.getByRole('button',{name:'Add Memory',exact:true}).filter({visible:true}).click();

  const manifest = {
    schema: 'minevault.capture.v1',
    event_id: 'demo-123',
    advancement_id: 'minecraft:story/mine_diamond',
    title: 'Diamonds!',
    occurred_at: '2026-10-19T10:15:22Z',
    captured_at: '2026-10-19T10:15:24Z',
    player_name: 'Alex',
    world: 'Singleplayer',
    dimension: 'minecraft:overworld',
    x: 84, y: -53, z: 92,
    minecraft_day: 18,
    perspective: 'FIRST_PERSON',
    players_online: ['Alex','Jade'],
    screenshot: 'demo-123.png'
  };

  await page.getByLabel(/Import MineVault Capture/).setInputFiles({
    name: 'demo-123.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(manifest)),
  });
  await expect(page.getByLabel('Give it a title')).toHaveValue('Diamonds!');
  await expect(page.getByLabel('X',{exact:true})).toHaveValue('84');
  await expect(page.getByLabel('Y',{exact:true})).toHaveValue('-53');
  await expect(page.getByLabel('Z',{exact:true})).toHaveValue('92');
  await expect(page.getByLabel('Minecraft day')).toHaveValue('18');
  await expect(page.getByLabel('The story')).toHaveValue(/Players online at event: Alex, Jade/);
  await page.getByRole('button',{name:'Save memory',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Diamonds!',exact:true})).toBeVisible();
});
