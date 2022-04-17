import { AdonisSequelizeContract, SequelizeConfig } from '@ioc:Adonis/Sequelize/Sequelize';
import { LoggerContract } from '@ioc:Adonis/Core/Logger';
import { Macroable } from 'macroable';
import {
  Sequelize,
  Transaction,
  TransactionOptions,
  QueryTypes,
  QueryOptions,
  QueryOptionsWithType,
  DataTypes
} from 'sequelize';

export class AdonisSequelize extends Macroable implements AdonisSequelizeContract {
  /**
   * Required by macroable
   */
  protected static macros = {};
  protected static getters = {};

  public AdonisSequlize = AdonisSequelize;
  public sequelize: Sequelize;
  public dataTypes: typeof DataTypes;

  constructor(
    private config: SequelizeConfig,
    private logger: LoggerContract
  ) {
    super();
    this.dataTypes = DataTypes;
    this.connectSequelize().then(() => {});
  }

  // TODO: убрать, если не пригодится
  /*private createError(error: Error, message: String): string {
    this.logger.error(message + `. Детали: ${error.message}`);
  }*/

  private async connectSequelize() {
    let storage: string | undefined;

    const { port, pool, username, password, dialect, host, database } = this.config;

    if (dialect === 'sqlite') {
      storage = database;
    }

    this.sequelize = new Sequelize({
      dialect,
      host,
      port: Number(port),
      database,
      username,
      password,
      storage,
      pool,
      logging: this.logger.debug
    });
  }

  public getQueryInterface() {
    return this.sequelize.getQueryInterface();
  }

  public transaction<T>(options: TransactionOptions, autoCallback: (t: Transaction) => PromiseLike<T>): Promise<T>;
  public transaction<T>(autoCallback: (t: Transaction) => PromiseLike<T>): Promise<T>;
  public transaction(options?: TransactionOptions): Promise<Transaction>
  public transaction<T>(
    options?: TransactionOptions | ((t: Transaction) => PromiseLike<T>),
    autoCallback?: (t: Transaction) => PromiseLike<T>
  ) {
    if (typeof options === 'function') {
      autoCallback = options;
      return this.sequelize.transaction(autoCallback);
    }

    if (typeof options === 'object' && typeof autoCallback === 'function') {
      return this.sequelize.transaction<T>(options, autoCallback);
    }

    return this.sequelize.transaction(options);
  }

  public rawQuery<T extends QueryTypes>(sql: string, options?: QueryOptions | QueryOptionsWithType<T>) {
    return this.sequelize.query(sql, options);
  }
}
