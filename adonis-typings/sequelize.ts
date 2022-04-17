/*
 * adonis-lucid-soft-deletes
 *
 * (c) Lookin Anton <lookin@lookinlab.ru>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference types="sequelize" />

declare module '@ioc:Adonis/Sequelize/Sequelize' {
  import {
    Dialect as SequelizeDialect,
    PoolOptions,
    Sequelize,
    QueryInterface,
    TransactionOptions,
    Transaction,
    QueryOptionsWithType,
    QueryOptions,
    QueryTypes,
    DataTypes
  } from 'sequelize';
  import { LoggerContract } from '@ioc:Adonis/Core/Logger';
  import { MacroableConstructorContract } from 'macroable';

  export { QueryInterface, Transaction } from 'sequelize';

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
    dataTypes: typeof DataTypes;

    AdonisSequlize: MacroableConstructorContract<AdonisSequelizeContract> & {
      new (
        config: SequelizeConfig,
        logger: LoggerContract,
      ): AdonisSequelizeContract
    }

    getQueryInterface(): QueryInterface;

    rawQuery(sql: string, options?: QueryOptions): Promise<[unknown[], unknown]>;
    rawQuery<T extends QueryTypes>(
      sql: string,
      options?: QueryOptionsWithType<T>
    ): Promise<[unknown[], unknown]>;

    transaction<T>(options: TransactionOptions, autoCallback: (t: Transaction) => PromiseLike<T>): Promise<T>;
    transaction<T>(autoCallback: (t: Transaction) => PromiseLike<T>): Promise<T>;
    transaction(options?: TransactionOptions): Promise<Transaction>;
  }

  const AdonisSequelize: AdonisSequelizeContract;

  export default AdonisSequelize;
}
