/*
 * adonis-lucid-soft-deletes
 *
 * (c) Lookin Anton <lookin@lookinlab.ru>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Core/Application' {
  import { AdonisSequelizeContract } from '@ioc:Adonis/Sequelize/Sequelize';
  import * as Orm from '@ioc:Adonis/Sequelize/Orm';

  export interface ContainerBindings {
    'Adonis/Sequelize/Sequelize': AdonisSequelizeContract;
    'Adonis/Sequelize/Orm': {
      BaseModel: typeof Orm.BaseModel
    };
  }
}
