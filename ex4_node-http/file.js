const fs = require('node:fs/promises');

async function createFile(filename, content = 'Hello, World!') {
  await fs.writeFile(filename, content, 'utf8');
}

async function readFile(filename) {
  return fs.readFile(filename, 'utf8');
}

async function appendToFile(filename, content) {
  await fs.appendFile(filename, content, 'utf8');
}

async function deleteFile(filename) {
  await fs.unlink(filename);
}

module.exports = { createFile, readFile, appendToFile, deleteFile };
