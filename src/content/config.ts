import { defineCollection, z } from 'astro:content';

const researchCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    short_name: z.string(),
    cover: z.enum(['blue', 'rose', 'sand']),
    blurb: z.string(),
    lede: z.string(),
    description: z.string(),
    tldr: z.string(),
    abstract: z.string(),
    venue: z.string(),
    proceedings: z.string(),
    status: z.enum(['accepted', 'published']),
    sort_date: z.date(),
    published_date: z.date().optional(),
    authors: z.array(
      z.object({
        name: z.string(),
        is_me: z.boolean().default(false),
        is_corresponding: z.boolean().default(false),
        profile: z.string().url().optional(),
      })
    ),
    affiliation_note: z.string().optional(),
    award: z.string().optional(),
    awards: z
      .array(
        z.object({
          label: z.string(),
          result: z.string(),
        })
      )
      .default([]),
    event: z
      .object({
        announcement: z.string(),
        label: z.string(),
        venue: z.string(),
        location: z.string(),
        start_date: z.string().optional(),
        end_date: z.string().optional(),
        url: z.string().url(),
        verified_links: z
          .array(
            z.object({
              label: z.string(),
              url: z.string().url(),
            })
          )
          .default([]),
      })
      .optional(),
    links: z
      .array(
        z.object({
          label: z.string(),
          url: z.string().url(),
          primary: z.boolean().optional(),
        })
      )
      .default([]),
    bibtex: z.string().optional(),
    primary_url: z.string().url().optional(),
    same_as: z.array(z.string().url()).default([]),
  }),
});

const blogsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    brief: z.string(),
    dateAdded: z.coerce.date(),
    hashnodeUrl: z.string().url(),
    readTimeInMinutes: z.number().int().positive(),
    author: z.string().default('Rishi Ahuja'),
    cover: z.enum([
      'sky',
      'peach',
      'mist',
      'mint',
      'prismer',
      'rose',
      'sand',
      'reco',
      'lilac',
      'clay',
      'sage',
      'blue',
    ]),
    coverImage: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = {
  research: researchCollection,
  blogs: blogsCollection,
};
