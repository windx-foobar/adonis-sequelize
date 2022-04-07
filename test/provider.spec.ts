import test from 'japa';

import { AdonisSequelize } from '../src/AdonisSequelize';

import { setupApplication, fs } from '../test-helpers';

test.group('Adonis Sequelize Provider', (group) => {
  group.afterEach(async() => {
    await fs.cleanup();
  });

  test('register adonis seqelize provider', async(assert) => {
    const app = await setupApplication(['../../providers/AdonisSequelizeProvider.ts']);

    assert.instanceOf(app.container.use('Adonis/Sequelize'), AdonisSequelize);
  });
});
