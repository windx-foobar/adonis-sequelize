/// <reference path="../adonis-typings/index.ts" />

import test from 'japa';

import { ApplicationContract } from '@ioc:Adonis/Core/Application';
import { Transaction } from '@ioc:Adonis/Sequelize/Sequelize';
import { setupApplication, getSequelize, getBaseModel, setup, cleanup, fs, Maybe } from '../test-helpers';

let app: ApplicationContract;
let adonisSequelize: ReturnType<typeof getSequelize>;
let BaseModel: ReturnType<typeof getBaseModel>;
let autoIncrement: number;

type RawRow = { [key: string]: any };

test.group('Adonis Sequelize BaseModel', (group) => {
  group.before(async() => {
    app = await setupApplication({
      loggerLevel: 'info',
      createDatabaseFile: true
    });
    adonisSequelize = getSequelize(app);
    BaseModel = getBaseModel(adonisSequelize);

    await setup(adonisSequelize);
    autoIncrement = 0;
  });

  group.after(async() => {
    autoIncrement = 0;
    await cleanup(adonisSequelize);
    await fs.cleanup();
  });

  test('создание записи с помощью new Model() + save', async(assert) => {
    class User extends BaseModel {
      declare public id: number;
      declare public email: string;
      declare public username: string;
      declare public age: number;
    }

    const { dataTypes } = User.$adapter;

    User.init(
      {
        email: {
          type: dataTypes.STRING,
          unique: true
        },
        username: {
          type: dataTypes.STRING,
          unique: true
        }
      },
      { tableName: 'users' }
    );

    let transaction: Maybe<Transaction> = null;
    try {
      transaction = await adonisSequelize.transaction();

      const user = new User();
      user.age = 25;
      user.username = 'user1';
      user.email = 'user1@mail.ru';
      await user.save({ transaction });
      autoIncrement++;

      const [rawUsers] = await adonisSequelize.rawQuery(
        `SELECT id, email, username FROM users WHERE id = ${autoIncrement}`,
        { transaction }
      );
      const rawUser = rawUsers[0] as RawRow;

      // Должно найти единственную запись
      assert.equal(rawUsers.length, 1);

      //"email" в базе должен правильно сохраниться
      assert.equal(rawUser.email, user.email);

      // "username" в базе должен правильно сохраниться
      assert.equal(rawUser.username, user.username);

      // "id" модели должен автоматически сгенерироваться
      assert.equal(user.id, autoIncrement);

      // "id" записи в базе должен автоинкрементироваться
      assert.equal(rawUser.id, autoIncrement);

      // "age" не должен сохраниться в базе
      assert.isUndefined(rawUser.age);

      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();
      throw error;
    }
  });

  test('создание записи с помощью Model.create()', async(assert) => {
    class User extends BaseModel {
      declare public id: number;
      declare public email: string;
      declare public username: string;
      declare public age: number;
    }

    const $adapter = User.$adapter;
    const { dataTypes } = $adapter;

    User.init(
      {
        email: {
          type: dataTypes.STRING,
          unique: true
        },
        username: {
          type: dataTypes.STRING,
          unique: true
        }
      },
      { tableName: 'users' }
    );

    let transaction: Maybe<Transaction> = null;
    try {
      transaction = await $adapter.transaction();

      const user = await User.create({
        email: 'user2@mail.ru',
        username: 'user2'
      }, { transaction });
      autoIncrement++;

      const [rawUsers] = await $adapter.rawQuery(
        `SELECT id, email, username FROM users WHERE id = ${autoIncrement}`,
        { transaction }
      );
      const rawUser = rawUsers[0] as RawRow;

      // Должно найти единственную запись
      assert.equal(rawUsers.length, 1);

      //"email" в базе должен правильно сохраниться
      assert.equal(rawUser.email, user.email);

      // "username" в базе должен правильно сохраниться
      assert.equal(rawUser.username, user.username);

      // "id" модели должен автоматически сгенерироваться
      assert.equal(user.id, autoIncrement);

      // "id" записи в базе должен автоинкрементироваться
      assert.equal(rawUser.id, autoIncrement);

      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();
      throw error;
    }
  });
});
