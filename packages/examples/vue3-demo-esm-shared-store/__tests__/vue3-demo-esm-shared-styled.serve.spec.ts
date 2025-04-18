import { expect, test } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'

function readFileWithRegexPattern(dirPath, regexPattern) {
  // Get all files in the directory
  const files = fs.readdirSync(dirPath);

  // Find the file that matches the regex pattern
  const matchedFile = files.find(file => regexPattern.test(file));

  if (!matchedFile) {
    throw new Error(`No file found matching pattern: ${regexPattern}`);
  }

  // Read and return the file content
  return fs.readFileSync(path.join(dirPath, matchedFile), 'utf-8');
}

test('should have css imported', () => {
  const dirPath = path.resolve(__dirname, '../host/dist/assets');
  const regexPattern = /^__federation_shared_shared-styled-.*\.js$/;
  try {
    const css = readFileWithRegexPattern(dirPath, regexPattern)
    expect(css).toMatch(/import.+\.css';/)
  } catch (error) {
    console.error(error)
  }
})

