/*
 * adonis-lucid-soft-deletes
 *
 * (c) Lookin Anton <lookin@lookinlab.ru>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ApplicationContract } from '@ioc:Adonis/Core/Application';

/**
 * Provider to register lucid sequelize
 */
export default class AdonisSeqelizeProvider {
  public static needsApplication = true;
  constructor(protected app: ApplicationContract) {}

  public register(): void {
    this.registerSequelize();
    this.registerOrm();
  }

  public boot(): void {}

  private registerSequelize() {
    this.app.container.singleton('Adonis/Sequelize/Sequelize', () => {
      const config = this.app.container.resolveBinding('Adonis/Core/Config').get('sequelize', {});
      const logger = this.app.container.resolveBinding('Adonis/Core/Logger');

      const { AdonisSequelize } = require('../src/AdonisSequelize');
      return new AdonisSequelize(config, logger);
    });
  }

  private registerOrm() {
    this.app.container.singleton('Adonis/Sequelize/Orm', () => {
      const { BaseModel } = require('../src/AdonisSequelize/Orm/BaseModel');

      BaseModel.$adapter = this.app.container.resolveBinding('Adonis/Sequelize/Sequelize');

      return {
        BaseModel
      };
    });
  }

  public async shutdown() {
    await this.app.container.resolveBinding('Adonis/Sequelize/Sequelize').sequelize.close();
  }
}
