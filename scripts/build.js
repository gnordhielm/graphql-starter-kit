/**
 * GraphQL Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2016-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

const fs = require('fs');
const cp = require('child_process');
const pkg = require('../package.json');
const clean = require('./clean');
const task = require('./lib/task');

module.exports = task(() => Promise.resolve()
  .then(clean)
  .then(() => new Promise((resolve) => {
    cp.spawn('node', [
      'node_modules/babel-cli/bin/babel.js',
      'src',
      '--out-dir',
      'build',
      '--source-maps',
      ...(process.argv.includes('--watch') || process.argv.includes('-w') ? ['--watch'] : []),
    ], { stdio: ['inherit', 'pipe', 'inherit'] })
      .on('exit', resolve)
      .stdout.on('data', (data) => {
        if (data.toString().startsWith('src/server.js')) {
          const src = fs.readFileSync('build/server.js', 'utf8');
          fs.writeFileSync('build/server.js', `require('source-map-support').install(); ${src}`, 'utf8');
        }
        process.stdout.write(data);
      });
  }))
  .then(() => new Promise((resolve) => {
    fs.writeFileSync('build/package.json', JSON.stringify({
      engines: pkg.engines,
      dependencies: pkg.dependencies,
      scripts: { start: 'node server.js' },
    }, null, '  '), 'utf8');
    process.stdout.write('package.json -> build/package.json\n');
    resolve();
  })));