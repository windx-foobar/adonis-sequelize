import { join } from 'path';
import { ApplicationContract } from '@ioc:Adonis/Core/Application';
import * as sinkStatic from '@adonisjs/sink';

/**
 * Environment variables
 */
const SEQUELIZE_ENV_VALUES = {
  DB_DIALECT: 'postgres',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_NAME: 'database_name',
  DB_USER: 'database_user',
  DB_PASSWORD: 'secret'
};

function getStub(...relativePaths: string[]) {
  return join(__dirname, 'templates', ...relativePaths);
}

export default async function instructions(
  projectRoot: string,
  app: ApplicationContract,
  sink: typeof sinkStatic
) {
  /**
   * Create config file
   */
  const configPath = app.configPath('sequelize.ts');
  const sequelizeConfig = new sink.files.MustacheFile(
    projectRoot,
    configPath,
    getStub('database.txt')
  );
  sequelizeConfig.commit();
  const configDir = app.directoriesMap.get('config') || 'config';
  sink.logger.action('create').succeeded(`${configDir}/sequelize.ts`);

  /**
   * Setup .env file
   */
  const env = new sink.files.EnvFile(projectRoot);

  /**
   * Unset old values
   */
  Object.keys(SEQUELIZE_ENV_VALUES).forEach((key) => {
    env.unset(key);
  });
  Object.keys(SEQUELIZE_ENV_VALUES).forEach((key) => {
    env.set(key, SEQUELIZE_ENV_VALUES[key]);
  });

  env.commit();
  sink.logger.action('update').succeeded('.env, .env.example');

  /**
   * Install required dependencies
   */
  const pkg = new sink.files.PackageJsonFile(projectRoot);

  pkg.install('sequelize', '^6.18.0', false);

  const logLines = [
    `Installing: ${sink.logger.colors.gray(pkg.getInstalls(false).list.join(', '))}`
  ];

  const spinner = sink.logger.await(logLines.join(' '));

  try {
    await pkg.commitAsync();
    spinner.update('Packages installed');
  } catch (error) {
    spinner.update('Unable to install packages');
    sink.logger.fatal(error);
  }

  spinner.stop();
}
