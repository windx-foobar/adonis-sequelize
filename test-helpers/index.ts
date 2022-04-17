/*
 * adonis-lucid-soft-deletes
 *
 * (c) Lookin Anton <lookin@lookinlab.ru>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../adonis-typings/index.ts" />

import { join } from 'path';
import { Filesystem } from '@poppinss/dev-utils';
import { Application } from '@adonisjs/core/build/standalone';
import { FakeLogger } from './FakeLogger';
import { BaseModel } from '../src/AdonisSequelize/Orm/BaseModel';
import { AdonisSequelize } from '../src/AdonisSequelize';
import { AdonisSequelizeContract, Transaction } from '@ioc:Adonis/Sequelize/Sequelize';
import { ApplicationContract } from '@ioc:Adonis/Core/Application';

export type Maybe<T> = T | undefined | null;

export const fs = new Filesystem(join(__dirname, 'tmp'));

interface SetupApplicationOptions {
  additionalProviders: string[],
  environment: 'web' | 'repl' | 'test',
  loggerLevel: 'info' | 'debug',
  createDatabaseFile: boolean,
  fakeDbName: string
}

export async function setupApplication(options: Partial<SetupApplicationOptions>) {
  const {
    additionalProviders = [],
    environment = 'test',
    loggerLevel = 'info',
    createDatabaseFile = false,
    fakeDbName = 'db.sqlite3'
  } = options;

  const fakeDbConfig = {
    dialect: 'sqlite',
    database: fs.basePath + `/${fakeDbName}`
  };

  await fs.add('.env', '');
  await fs.add(
    'config/app.ts',
    `
    export const appKey = 'averylong32charsrandomsecretkey';
    export const http = {
      cookie: {},
      trustProxy: () => true,
    }
  `
  );

  await fs.add(
    'config/sequelize.ts',
    `
    const dbConfig = ${JSON.stringify(fakeDbConfig, null, 2)}
    export default dbConfig
  `
  );
  if (createDatabaseFile) {
    await fs.add(fakeDbName, '');
  }

  const app = new Application(fs.basePath, environment, {
    aliases: {
      App: './app'
    },
    providers: ['@adonisjs/core'].concat(additionalProviders || [])
  });

  await app.setup();
  await app.registerProviders();
  await app.bootProviders();

  app.container.singleton('Adonis/Core/Logger', () => {
    return new FakeLogger(loggerLevel);
  });

  if (process.env.DEBUG) {}

  return app;
}

/**
 * Returns the adonis sequelize instance
 */
export function getSequelize(application: ApplicationContract) {
  return new AdonisSequelize(
    application.config.get('sequelize'),
    application.container.use('Adonis/Core/Logger'),
  ) as AdonisSequelizeContract;
}

/**
 * Returns the base model with the adapter attached to it
 */
export function getBaseModel(adapter: AdonisSequelizeContract) {
  BaseModel.$adapter = adapter;
  return BaseModel;
}

/**
 * Does base setup by creating databases
 */
export async function setup(adonisSequelize: AdonisSequelizeContract) {
  let transaction: Maybe<Transaction> = null;
  try {
    transaction = await adonisSequelize.transaction();

    await adonisSequelize.rawQuery(
      `
        CREATE TABLE IF NOT EXISTS "users" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "username" VARCHAR(255) NOT NULL UNIQUE,
          "email" VARCHAR(255) NOT NULL UNIQUE,

          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
          "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL,
          "deleted_at" TIMESTAMP WITH TIME ZONE
        );
      `,
      {
        transaction
      }
    );

    await transaction.commit();
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }

    throw error;
  }

  /*if (!hasUsersTable) {
    await db.schema.createTable('users', (table) => {
      table.increments();
      table.integer('country_id');
      table.string('username').unique();
      table.string('email').unique();
      table.integer('points').defaultTo(0);
      table.timestamp('joined_at', { useTz: process.env.DB === 'mssql' });
      table.integer('parent_id').nullable();
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').nullable();
    });
  }*/
}

/**
 * Does cleanup removes database
 */
export async function cleanup(adonisSequelize: AdonisSequelizeContract) {
  const queryInterface = adonisSequelize.getQueryInterface();

  let transaction: Maybe<Transaction> = null;
  try {
    transaction = await adonisSequelize.transaction();

    await queryInterface.dropTable('users', {
      transaction
    });

    await transaction.commit();
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }

    throw error;
  }
}
