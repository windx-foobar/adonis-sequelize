import { FakeLogger as Logger } from '@adonisjs/logger/build';

export class FakeLogger extends Logger {
  constructor(level: 'info' | 'debug' = 'debug') {
    super({
      name: 'fake',
      level,
      enabled: true
    });

    const logMethods: string[] = ['log', 'debug', 'info'];
    const errorMethods: string[] = ['error'];

    for (const method of logMethods) {
      this[method] = function(this: FakeLogger, ...args: any[]) {
        if (method === 'debug') {
          if (this.level === 'debug') {
            console.log(`LOGGER ${method.toUpperCase()}`);
            console.log(...args);
          }
        } else {
          console.log(`LOGGER ${method.toUpperCase()}`);
          console.log(...args);
        }
      }.bind(this);
    }

    for (const method of errorMethods) {
      this[method] = function(this: FakeLogger, ...args: any[]) {
        console.log(`LOGGER ${method.toUpperCase()}`);
        console.error(...args);
      }.bind(this);
    }
  }
}
