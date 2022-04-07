/*
 * adonis-lucid-soft-deletes
 *
 * (c) Lookin Anton <lookin@lookinlab.ru>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference types="sequelize" />

declare module '@ioc:Adonis/Sequelize' {
  import { Dialect as SequelizeDialect, PoolOptions, Sequelize } from 'sequelize';
  import { LoggerContract } from '@ioc:Adonis/Core/Logger';
  import { MacroableConstructorContract } from 'macroable';

  type AllowedDialects = 'mysql' | 'postgres' | 'sqlite' | 'mariadb';
  export type Dialect = Extract<SequelizeDialect, AllowedDialects>;

  export type SequelizeConfig = {
    dialect: Dialect,
    host: string,
    port: string | number,
    database: string,
    username: string,
    password: string,
    pool: Pick<PoolOptions, 'max' | 'min' | 'idle'>
  };

  export interface AdonisSequelizeContract {
    sequelize: Sequelize;

    AdonisSequlize: MacroableConstructorContract<AdonisSequelizeContract> & {
      new (
        config: SequelizeConfig,
        logger: LoggerContract,
      ): AdonisSequelizeContract
    }
  }

  const AdonisSequelize: AdonisSequelizeContract;

  export default AdonisSequelize;
}
