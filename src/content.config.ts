import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'

/**
 * A custom loader that conditionally uses a local path (for dev) 
 * or clones from a remote repository at build time.
 * We delegate to Astro's robust `glob` loader for actual file processing 
 * so MDX plugins remain intact.
 */
function createGithubLoader({ repo, baseLocalDir, baseContentDir }: { repo: string, baseLocalDir?: string, baseContentDir: string }) {
  let contentDir = baseContentDir;

  if (baseLocalDir && existsSync(baseLocalDir)) {
    contentDir = path.join(baseLocalDir, baseContentDir.replace('./src/content/', ''));
  } else if (!baseLocalDir) {
    contentDir = path.join('.content', baseContentDir.replace('./src/content/', ''));
  }

  const baseLoader = glob({ pattern: '**/*.{md,mdx}', base: contentDir });

  return {
    name: 'custom-github-loader',
    async load(context: any) {
      if (!baseLocalDir) {
        if (!existsSync('.content')) {
          context.logger.info(`Cloning repository ${repo} for content...`);
          execSync(`git clone https://github.com/${repo} .content`, { stdio: 'inherit' });
        } else {
          context.logger.info(`Pulling latest changes for ${repo}...`);
          execSync(`cd .content && git pull`, { stdio: 'ignore' });
        }
      } else {
        context.logger.info(`Using local content path: ${baseLocalDir}`);
      }
      return baseLoader.load(context);
    }
  };
}

// Env variable allows overriding to local directory like `/Users/nguyen/Documents/Workspace/GitHub/cs4all-content`
const baseLocalDir = process.env.CONTENT_DIR

const note = defineCollection({
  loader: createGithubLoader({
    repo: 'vietfood/cs4all-content',
    baseLocalDir,
    baseContentDir: './src/content/note'
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      order: z.number(), // required
      subject: z.string(), // required
      chapter: z.string(), // required
      exercise: z.boolean().default(false), // required/default
      author: z.string(), // required
      last_updated: z.coerce.date(), // required
      image: image().optional(),
      tags: z.array(z.string()).optional(),
      authors: z.array(z.string()).optional(),
      draft: z.boolean().optional(),
    }),
})

const authors = defineCollection({
  loader: createGithubLoader({
    repo: 'vietfood/cs4all-content',
    baseLocalDir,
    baseContentDir: './src/content/authors'
  }),
  schema: z.object({
    name: z.string(),
    pronouns: z.string().optional(),
    avatar: z.string().url().or(z.string().startsWith('/')),
    bio: z.string().optional(),
    mail: z.string().email().optional(),
    website: z.string().url().optional(),
    twitter: z.string().url().optional(),
    github: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    discord: z.string().url().optional(),
  }),
})

const subject = defineCollection({
  loader: createGithubLoader({
    repo: 'vietfood/cs4all-content',
    baseLocalDir,
    baseContentDir: './src/content/subject'
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      image: image().optional(),
      order: z.number().optional(),
    }),
})

export const collections = { note, authors, subject }
