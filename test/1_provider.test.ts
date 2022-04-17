import test from 'japa';

import { AdonisSequelize } from '../src/AdonisSequelize';
import { BaseModel } from '../src/AdonisSequelize/Orm/BaseModel';

import { setupApplication, fs } from '../test-helpers';

test.group('Adonis Sequelize Provider', (group) => {
  group.after(async() => {
    await fs.cleanup();
  });

  test('проверка правильной регистрации в сервис контейнер', async(assert) => {
    const app = await setupApplication({
      additionalProviders: ['../../providers/AdonisSequelizeProvider.ts']
    });

    assert.instanceOf(app.container.use('Adonis/Sequelize/Sequelize'), AdonisSequelize);
    assert.deepEqual(app.container.use('Adonis/Sequelize/Orm'), {
      BaseModel
    });
  });
});
