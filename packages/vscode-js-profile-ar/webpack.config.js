module.exports = [
  require('../../scripts/webpack.extension')(__dirname, 'node'),
  ...(process.argv.includes('--watch')
    ? []
    : [require('../../scripts/webpack.extension')(__dirname, 'webworker')])
];
