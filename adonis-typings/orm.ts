/*
 * adonis-lucid-soft-deletes
 *
 * (c) Lookin Anton <lookin@lookinlab.ru>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference types="sequelize" />

declare module '@ioc:Adonis/Sequelize/Orm' {
  import { Model, ModelStatic } from 'sequelize';
  import { AdonisSequelizeContract } from '@ioc:Adonis/Sequelize/Sequelize';

  export type SequelizeModels = { [key: string]: ModelStatic<Model> };
  export interface SequelizeModel {
    $adapter: AdonisSequelizeContract;
  }

  export const BaseModel: SequelizeModel;
}
