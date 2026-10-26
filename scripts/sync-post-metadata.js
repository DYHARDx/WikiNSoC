#!/usr/bin/env node

/**
 * NSoC Wiki Post Metadata Synchronizer & Backfiller
 * Updates or backfills wordCount and readingTime in posts-metadata.json
 *
 * Can be run:
 * 1. Manually by maintainers to backfill or re-sync all posts:
 *      node scripts/sync-post-metadata.js
 * 2. On specific post(s):
 *      node scripts/sync-post-metadata.js posts/my-post.mdx
 *
 * Usage:
 *   node scripts/sync-post-metadata.js [optional-file-paths...]
 */

const fs = require('fs');
const path = require('path');
const { calculatePostStats } = require('./calculate-post-stats');

function syncPostMetadata(targetFiles = []) {
  const rootDir = path.resolve(__dirname, '..');
  const postsDir = path.join(rootDir, 'posts');
  const metadataPath = path.join(rootDir, 'posts-metadata.json');

  let metadata = {};
  if (fs.existsSync(metadataPath)) {
    try {
      metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    } catch (e) {
      console.warn('Could not parse posts-metadata.json, initializing empty object:', e.message);
      metadata = {};
    }
  }

  let slugsToUpdate = [];
  if (targetFiles.length > 0) {
    slugsToUpdate = targetFiles
      .filter((f) => f.endsWith('.mdx'))
      .map((f) => path.basename(f, '.mdx'));
  } else {
    // Backfill all posts present in posts/ directory
    if (fs.existsSync(postsDir)) {
      slugsToUpdate = fs
        .readdirSync(postsDir)
        .filter((f) => f.endsWith('.mdx'))
        .map((f) => path.basename(f, '.mdx'));
    }
  }

  let updatedCount = 0;

  slugsToUpdate.forEach((slug) => {
    const postFile = path.join(postsDir, `${slug}.mdx`);
    if (!fs.existsSync(postFile)) {
      console.warn(`Post file not found: ${postFile}`);
      return;
    }

    const content = fs.readFileSync(postFile, 'utf8');
    const { wordCount, readingTime } = calculatePostStats(content);

    // If metadata doesn't exist yet for this post, create a skeleton
    if (!metadata[slug]) {
      metadata[slug] = {
        author: 'NSoC Contributor',
        githubUsername: 'contributor',
        labels: [],
        updatedAt: new Date().toISOString(),
      };
    }

    // Preserve all existing fields, only add or update wordCount & readingTime
    metadata[slug].wordCount = wordCount;
    metadata[slug].readingTime = readingTime;
    updatedCount++;

    console.log(`  • ${slug}: ${wordCount} words, ${readingTime} min read`);
  });

  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
  console.log(`\n✔ Successfully synced metadata for ${updatedCount} post(s) in posts-metadata.json\n`);
  return metadata;
}

if (require.main === module) {
  const cliArgs = process.argv.slice(2);
  syncPostMetadata(cliArgs);
}

module.exports = { syncPostMetadata };
