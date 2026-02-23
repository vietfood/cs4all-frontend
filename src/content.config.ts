import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'

/**
 * Content loader that uses different sources based on environment:
 * - Development: Uses the `.content/` directory (local clone)
 * - Production: Clones from the remote GitHub repository
 * 
 * In development, you should have a `.content/` directory with the content repo
 * cloned. You can set this up once with:
 *   git clone https://github.com/vietfood/cs4all-content .content
 * 
 * The loader will auto-clone if `.content/` doesn't exist yet.
 */
function createGithubLoader({ repo, contentSubdir }: { repo: string; contentSubdir: string }) {
  const contentBase = path.join('.content', contentSubdir)

  const baseLoader = glob({ pattern: '**/*.{md,mdx}', base: contentBase })

  return {
    name: 'github-content-loader',
    async load(context: any) {
      if (!existsSync('.content')) {
        context.logger.info(`Cloning ${repo} into .content/...`)
        execSync(`git clone https://github.com/${repo} .content`, { stdio: 'inherit' })
      } else if (import.meta.env.PROD) {
        // In production builds, always pull latest
        context.logger.info(`Pulling latest from ${repo}...`)
        execSync(`cd .content && git pull`, { stdio: 'ignore' })
      } else {
        context.logger.info(`Using local .content/${contentSubdir}`)
      }

      return baseLoader.load(context)
    },
  }
}

const note = defineCollection({
  loader: createGithubLoader({
    repo: 'vietfood/cs4all-content',
    contentSubdir: 'note',
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      order: z.number(),
      subject: z.string(),
      chapter: z.string(),
      exercise: z.boolean().default(false),
      author: z.string(),
      last_updated: z.coerce.date(),
      image: image().optional(),
      tags: z.array(z.string()).optional(),
      authors: z.array(z.string()).optional(),
      draft: z.boolean().optional(),
      // Optional LLM grading context — subject/chapter-specific instructions
      // for the AI grader. Parsed by the backend from raw MDX frontmatter.
      grading_context: z.string().optional(),
    }),
})

const authors = defineCollection({
  loader: createGithubLoader({
    repo: 'vietfood/cs4all-content',
    contentSubdir: 'authors',
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
    contentSubdir: 'subject',
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
