const fs = require('fs');
const path = require('path');

async function run() {
  const resolveApp = (...src) => path.resolve(__dirname, '..', ...src);

  const excluded = ['build', 'package.json', 'README.md'];

  const names = await fs.promises.readdir(process.cwd());

  await Promise.all(names.map(async(name) => {
    if (!excluded.includes(name)) {
      await fs.promises.rm(resolveApp(name), { force: true, recursive: true });
    }
  }));
}

run();
