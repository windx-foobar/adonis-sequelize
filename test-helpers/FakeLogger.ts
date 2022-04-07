import { FakeLogger as Logger } from '@adonisjs/logger/build';

export class FakeLogger extends Logger {
  constructor() {
    super({
      name: 'fake',
      level: 'debug',
      enabled: true
    });

    const logMethods: string[] = ['log', 'debug', 'info'];
    const errorMethods: string[] = ['error'];

    for (const method of logMethods) {
      this[method] = function(...args: any[]) {
        console.log(...args);
      }.bind(this);
    }

    for (const method of errorMethods) {
      this[method] = function(...args: any[]) {
        console.error(...args);
      }.bind(this);
    }
  }
}
