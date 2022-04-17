import { SequelizeModel } from '@ioc:Adonis/Sequelize/Orm';
import { AdonisSequelizeContract } from '@ioc:Adonis/Sequelize/Sequelize';
import { Model } from 'sequelize';
import { Attributes, InitOptions, ModelAttributes, ModelStatic } from 'sequelize/types/model';

function StaticImplements<T>() {
  return (_t: T) => {};
}

@StaticImplements<SequelizeModel>()
export abstract class BaseModel extends Model {
  public static $adapter: AdonisSequelizeContract;

  public static init<MS extends ModelStatic<BaseModel>, M extends InstanceType<MS>>(
    this: MS,
    attributes: ModelAttributes<M, Attributes<M>>,
    options: Omit<InitOptions<M>, 'sequelize' | 'underscored'>
  ): MS {
    return Model.init.call(this, attributes, {
      ...options,
      sequelize: BaseModel.$adapter.sequelize,
      underscored: true
    });
  }
}
