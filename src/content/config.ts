import { z, defineCollection } from 'astro:content';
import { getCategoryIds } from '../config/categories';

const blogCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Terisuke'),
    category: z.enum(getCategoryIds() as [string, ...string[]]),
    tags: z.array(z.string()).default([]),
    image: z.object({
      url: z.string(),
      alt: z.string()
    }).optional(),
    ogImage: z.string().optional(),
    isDraft: z.boolean().default(false),
    featured: z.boolean().default(false),
    lang: z.enum(['ja', 'en']).default('ja'),
    readingTime: z.number().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
};