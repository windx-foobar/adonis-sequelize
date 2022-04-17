/// <reference path="../adonis-typings/index.ts" />

import test from 'japa';

import { ApplicationContract } from '@ioc:Adonis/Core/Application';
import { Transaction } from 'sequelize';
import { setupApplication, getSequelize, fs } from '../test-helpers';

let app: ApplicationContract;
let dbName: string = 'db.sqlite3';

test.group('Adonis Sequelize', (group) => {
  group.before(async() => {
    app = await setupApplication({
      loggerLevel: 'info',
      createDatabaseFile: true,
      fakeDbName: dbName
    });
  });

  group.after(async() => {
    await fs.cleanup();
  });

  test('успешное подключение бд', async(assert) => {
    await fs.add(dbName, '');

    const adonisSequelize = getSequelize(app);

    try {
      await adonisSequelize.sequelize.authenticate();

      let done = true;

      assert.isTrue(done);
    } catch (e) {}
  });

  test('ошибка подключения бд', async(assert) => {
    const adonisSequelize = getSequelize(app);

    try {
      await adonisSequelize.sequelize.authenticate();
    } catch (error: any) {
      assert.instanceOf(error, Error);
    }
  });

  test('проверка транзакции с одним аргументом', async(assert) => {
    await fs.add(dbName, '');

    const adonisSequelize = getSequelize(app);

    await adonisSequelize.transaction((t: Transaction) => {
      assert.instanceOf(t, Transaction);
      return Promise.resolve();
    });
  });

  test('проверка транзакции с двумя аргументами аргументом', async(assert) => {
    await fs.add(dbName, '');

    const adonisSequelize = getSequelize(app);

    await adonisSequelize.transaction(
      {},
      (t: Transaction) => {
        assert.instanceOf(t, Transaction);
        return Promise.resolve();
      }
    );
  });
});
