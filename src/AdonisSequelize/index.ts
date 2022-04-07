import { AdonisSequelizeContract, SequelizeConfig } from '@ioc:Adonis/Sequelize';
import { LoggerContract } from '@ioc:Adonis/Core/Logger';
import { Macroable } from 'macroable';
import { Sequelize } from 'sequelize';

export class AdonisSequelize extends Macroable implements AdonisSequelizeContract {
  /**
   * Required by macroable
   */
  protected static macros = {};
  protected static getters = {};

  public AdonisSequlize = AdonisSequelize;
  public sequelize: Sequelize;

  constructor(
    private config: SequelizeConfig,
    private logger: LoggerContract
  ) {
    super();
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
      pool
    });

    try {
      await this.sequelize.authenticate();

      this.logger.debug('Соединение с БД прошло успешно');
    } catch (error) {
      throw error;
    }
  }
}
