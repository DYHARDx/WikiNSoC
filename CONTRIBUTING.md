# 🤝 Contributing to WikiNSoC

Thank you for your interest in contributing to **WikiNSoC** and the **Nexus Spring of Code (NSoC)** community! 

This guide will help you get started with proposing new documentation, writing technical articles, fixing typos, and submitting pull requests.

---

## 🌟 Types of Contributions Welcome

You can contribute in many ways:
- 📝 **Write a New Wiki Article**: Write a guide, tutorial, or architecture overview on Open Source, Web Development, Cyber Security, Cloud, DevOps, or Software Engineering.
- 🔍 **Improve Existing Documentation**: Fix grammatical typos, outdated code examples, broken links, or improve clarity.
- 🏷️ **Suggest or Organize Categories**: Enhance metadata, tags, and topic structures.
- 🎨 **Visuals & Diagrams**: Add informative diagrams, architecture charts, or flowcharts.

---

## 🚀 Step-by-Step Contribution Workflow

### 1. Fork & Clone
Fork the repository on GitHub, then clone your fork:
```bash
git clone https://github.com/your-username/WikiNSoC.git
cd WikiNSoC
```

### 2. Create a Branch
Always create a new branch for your work:
```bash
git checkout -b post/my-article-topic
```

### 3. File Naming Rules
Place all articles in the `posts/` directory. Your filename must:
- Use **lowercase kebab-case** only (letters, numbers, single hyphens).
- End with `.mdx`.
- **Examples**:
  - ✅ `posts/docker-for-beginners.mdx`
  - ✅ `posts/git-rebase-tutorial.mdx`
  - ❌ `posts/Docker_Beginners.MDX`
  - ❌ `posts/git rebase.mdx`

### 4. Required Frontmatter
Every article must start with valid YAML frontmatter between `---` delimiters:

```markdown
---
title: "A Clear, Descriptive Article Title"
description: "A concise 1-2 sentence summary explaining what the reader will learn."
date: "YYYY-MM-DD"
category: "Technology"
tags:
  - open-source
  - tutorial
coverImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
published: true
featured: false
---
```

### 5. Validate Locally
Before committing, run the built-in validator:
```bash
npm run validate
```
Ensure there are **0 errors**.

### 6. Commit & Push
Write a clear commit message:
```bash
git add posts/my-article-topic.mdx
git commit -m "docs: add wiki article on my-article-topic"
git push -u origin post/my-article-topic
```

### 7. Open a Pull Request
Open a PR against the `main` branch of `DYHARDx/WikiNSoC`:
- Provide a brief summary of what your article covers.
- The automated GitHub Actions will validate your MDX file.
- Maintainers will review, suggest any improvements, assign homepage section labels, and merge!

---

## 🎖️ Contributor Recognition

Once your PR is merged:
1. GitHub Actions automatically extracts post metadata, computes word count and estimated reading time (ignoring frontmatter and code blocks), and updates `posts-metadata.json`.
2. GitHub Actions syncs your profile into `contributors.json`.
3. You will be proudly showcased on the live [wiki.nsoc.in/contributors](https://wiki.nsoc.in/contributors) page!

Happy contributing! 🚀
