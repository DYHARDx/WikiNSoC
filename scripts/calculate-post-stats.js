#!/usr/bin/env node

/**
 * NSoC Wiki Post Stats Calculator
 * Computes word count and estimated reading time for MDX articles.
 *
 * Rules:
 * 1. Frontmatter: Ignored completely (YAML enclosed by `---` delimiters at the start).
 * 2. Code blocks: Ignored completely (fenced code blocks delimited by ``` or ~~~).
 * 3. Word count: Remaining text is trimmed and split by whitespace (`/\s+/`).
 * 4. Reading time: Based on standard reading speed of 200 words per minute (WPM).
 *    Calculated as `Math.ceil(wordCount / 200)`. For non-empty posts with < 200 words,
 *    a minimum of 1 minute is assigned. If word count is 0, reading time is 0.
 *
 * Usage:
 *   CLI: node scripts/calculate-post-stats.js posts/my-post.mdx
 *   Module: const { calculatePostStats } = require('./calculate-post-stats');
 */

const fs = require('fs');
const path = require('path');

const WORDS_PER_MINUTE = 200;

/**
 * Strips YAML frontmatter from markdown/MDX content.
 * Frontmatter is defined between opening and closing `---` delimiters at the beginning of the file.
 *
 * @param {string} content - Raw markdown/MDX file content.
 * @returns {string} Content with frontmatter removed.
 */
function stripFrontmatter(content) {
  if (!content || typeof content !== 'string') return '';
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

/**
 * Strips fenced code blocks (``` or ~~~) from markdown/MDX content.
 *
 * @param {string} content - Markdown/MDX content.
 * @returns {string} Content with code blocks removed.
 */
function stripCodeBlocks(content) {
  if (!content || typeof content !== 'string') return '';
  return content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/~~~[\s\S]*?~~~/g, '');
}

/**
 * Computes word count from clean text body (after frontmatter and code blocks are removed).
 *
 * @param {string} content - Raw or cleaned markdown/MDX content.
 * @param {boolean} [preCleaned=false] - Whether frontmatter and code blocks have already been stripped.
 * @returns {number} Total word count.
 */
function calculateWordCount(content, preCleaned = false) {
  if (!content || typeof content !== 'string') return 0;
  const text = preCleaned ? content : stripCodeBlocks(stripFrontmatter(content));
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  return tokens.length;
}

/**
 * Computes estimated reading time in minutes from a word count.
 *
 * @param {number} wordCount - Total number of words.
 * @param {number} [wpm=200] - Reading speed in words per minute (default: 200).
 * @returns {number} Estimated reading time in integer minutes.
 */
function calculateReadingTime(wordCount, wpm = WORDS_PER_MINUTE) {
  if (!wordCount || wordCount <= 0) return 0;
  return Math.max(1, Math.ceil(wordCount / wpm));
}

/**
 * Computes both word count and estimated reading time for a given MDX post content.
 *
 * @param {string} content - Raw MDX post content.
 * @param {number} [wpm=200] - Words per minute speed.
 * @returns {{ wordCount: number, readingTime: number }}
 */
function calculatePostStats(content, wpm = WORDS_PER_MINUTE) {
  const cleanBody = stripCodeBlocks(stripFrontmatter(content));
  const wordCount = calculateWordCount(cleanBody, true);
  const readingTime = calculateReadingTime(wordCount, wpm);
  return { wordCount, readingTime };
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node scripts/calculate-post-stats.js <file-path>');
    process.exit(1);
  }

  args.forEach((file) => {
    const filePath = path.resolve(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const stats = calculatePostStats(content);
    console.log(`${path.basename(file)}:`, stats);
  });
}

module.exports = {
  WORDS_PER_MINUTE,
  stripFrontmatter,
  stripCodeBlocks,
  calculateWordCount,
  calculateReadingTime,
  calculatePostStats,
};
