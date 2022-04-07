/*
 * adonis-lucid-soft-deletes
 *
 * (c) Lookin Anton <lookin@lookinlab.ru>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'path';
import { Filesystem } from '@poppinss/dev-utils';
import { Application } from '@adonisjs/core/build/standalone';
import { FakeLogger } from './FakeLogger';

// import { ApplicationContract } from '@ioc:Adonis/Core/Application';

export const fs = new Filesystem(join(__dirname, 'tmp'));

export async function setupApplication(
  additionalProviders?: string[],
  environment: 'web' | 'repl' | 'test' = 'test'
) {
  const fakeDbName = 'db.sqlite3';

  const fakeDbConfig = {
    dialect: 'sqlite',
    database: fs.basePath + `/${fakeDbName}`
  };

  await fs.ensureRoot();

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
  await fs.add(fakeDbName, '');

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
    return new FakeLogger();
  });

  if (process.env.DEBUG) {}

  return app;
}
