#!/usr/bin/env node

/**
 * Unit tests for calculate-post-stats.js and metadata sync logic
 * Zero external dependencies (uses Node.js built-in assert).
 *
 * Run with: node scripts/test-calculate-post-stats.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
  WORDS_PER_MINUTE,
  stripFrontmatter,
  stripCodeBlocks,
  calculateWordCount,
  calculateReadingTime,
  calculatePostStats,
} = require('./calculate-post-stats');

console.log('Running test suite for post stats and counting rules...\n');

// 1. stripFrontmatter
{
  const withFm = `---
title: "Sample Title"
description: "Sample Description"
tags:
  - tag1
---
# Main Heading
This is the body content.`;

  const stripped = stripFrontmatter(withFm);
  assert.ok(!stripped.includes('title: "Sample Title"'), 'Frontmatter should be stripped');
  assert.ok(!stripped.includes('---'), 'Frontmatter delimiter should be stripped');
  assert.ok(stripped.includes('# Main Heading'), 'Main heading should be preserved');
  assert.ok(stripped.includes('This is the body content.'), 'Body should be preserved');

  // Without frontmatter
  const noFm = '# Just a Title\nBody without frontmatter';
  assert.strictEqual(stripFrontmatter(noFm), noFm, 'Content without frontmatter should remain unchanged');

  // CRLF line endings
  const crlfFm = '---\r\ntitle: "CRLF"\r\n---\r\n\r\nHello CRLF';
  assert.strictEqual(stripFrontmatter(crlfFm).trim(), 'Hello CRLF', 'CRLF line endings should be handled');

  console.log('  ✔ stripFrontmatter passed');
}

// 2. stripCodeBlocks
{
  const withCode = `Introduction paragraph.

\`\`\`javascript
const x = 10;
const y = 20;
console.log(x + y);
\`\`\`

Middle paragraph with \`inline code\` preserved.

~~~python
def hello():
    print("hello world")
~~~

Conclusion paragraph.`;

  const stripped = stripCodeBlocks(withCode);
  assert.ok(!stripped.includes('const x = 10;'), 'Fenced ``` javascript block should be stripped');
  assert.ok(!stripped.includes('def hello():'), 'Fenced ~~~ python block should be stripped');
  assert.ok(stripped.includes('Introduction paragraph.'), 'Introduction text should be preserved');
  assert.ok(stripped.includes('Middle paragraph with `inline code` preserved.'), 'Inline code and text should be preserved');
  assert.ok(stripped.includes('Conclusion paragraph.'), 'Conclusion text should be preserved');

  console.log('  ✔ stripCodeBlocks passed');
}

// 3. calculateWordCount
{
  // Empty
  assert.strictEqual(calculateWordCount(''), 0, 'Empty string has 0 words');
  assert.strictEqual(calculateWordCount('   \n\t  '), 0, 'Whitespace-only string has 0 words');

  // Only frontmatter
  const onlyFm = `---
title: "Only Frontmatter"
description: "Nothing else in body"
---
`;
  assert.strictEqual(calculateWordCount(onlyFm), 0, 'Content with only frontmatter has 0 words');

  // Only code blocks
  const onlyCode = `\`\`\`js
console.log("one two three four");
\`\`\``;
  assert.strictEqual(calculateWordCount(onlyCode), 0, 'Content with only code blocks has 0 words');

  // Prose with code blocks and frontmatter
  const fullArticle = `---
title: "Article"
date: "2026-10-18"
---

One two three four five.

\`\`\`bash
echo "ignored words inside code block"
\`\`\`

Six seven eight nine ten.`;

  assert.strictEqual(calculateWordCount(fullArticle), 10, 'Expected exactly 10 words outside frontmatter and code blocks');

  console.log('  ✔ calculateWordCount passed');
}

// 4. calculateReadingTime
{
  assert.strictEqual(calculateReadingTime(0), 0, '0 words should have 0 reading time');
  assert.strictEqual(calculateReadingTime(1), 1, '1 word should have minimum 1 min reading time');
  assert.strictEqual(calculateReadingTime(50), 1, '50 words should have 1 min reading time');
  assert.strictEqual(calculateReadingTime(200), 1, '200 words at 200 WPM should have 1 min reading time');
  assert.strictEqual(calculateReadingTime(201), 2, '201 words at 200 WPM should round up to 2 min reading time');
  assert.strictEqual(calculateReadingTime(400), 2, '400 words at 200 WPM should have 2 min reading time');
  assert.strictEqual(calculateReadingTime(401), 3, '401 words at 200 WPM should round up to 3 min reading time');

  // Custom WPM
  assert.strictEqual(calculateReadingTime(300, 100), 3, '300 words at 100 WPM should have 3 min reading time');

  console.log('  ✔ calculateReadingTime passed');
}

// 5. calculatePostStats on existing repository posts
{
  const postsDir = path.resolve(__dirname, '..', 'posts');

  const announcementContent = fs.readFileSync(path.join(postsDir, 'nsoc-announcement.mdx'), 'utf8');
  const announcementStats = calculatePostStats(announcementContent);
  assert.strictEqual(announcementStats.wordCount, 4, 'nsoc-announcement has 4 words ("Don\'t Touch This File")');
  assert.strictEqual(announcementStats.readingTime, 1, 'nsoc-announcement reading time should be 1 min');

  const nsocGuideContent = fs.readFileSync(path.join(postsDir, 'what-is-nexus-spring-of-code.mdx'), 'utf8');
  const nsocGuideStats = calculatePostStats(nsocGuideContent);
  assert.strictEqual(nsocGuideStats.wordCount, 1128, 'what-is-nexus-spring-of-code has 1128 words');
  assert.strictEqual(nsocGuideStats.readingTime, 6, 'what-is-nexus-spring-of-code reading time should be 6 min');

  const nsoc2027Content = fs.readFileSync(path.join(postsDir, 'nexus-spring-of-code-2027.mdx'), 'utf8');
  const nsoc2027Stats = calculatePostStats(nsoc2027Content);
  assert.strictEqual(nsoc2027Stats.wordCount, 774, 'nexus-spring-of-code-2027 has 774 words');
  assert.strictEqual(nsoc2027Stats.readingTime, 4, 'nexus-spring-of-code-2027 reading time should be 4 min');

  console.log('  ✔ calculatePostStats on repository posts passed');
}

console.log('\n🎉 All tests passed successfully!\n');
