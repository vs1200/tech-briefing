import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORY_SLUGS } from './data/categories';

const news = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/news' }),
  schema: z.object({
    date: z.coerce.date(),
    summary: z.string().min(1),
    items: z
      .array(
        z.object({
          title: z.string().min(1),
          categories: z.array(z.enum(CATEGORY_SLUGS)).min(1),
        }),
      )
      .min(1),
  }),
});

export const collections = { news };
