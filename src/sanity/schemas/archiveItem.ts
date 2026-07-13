import { defineField, defineType } from 'sanity'

export const archiveItem = defineType({
  name: 'archiveItem',
  title: 'Archive item',
  type: 'document',
  fields: [
    defineField({
      name: 'kind',
      title: 'Kind',
      type: 'string',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'GIF', value: 'gif' },
          { title: 'Video', value: 'video' }
        ],
        layout: 'radio'
      },
      initialValue: 'image',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'image',
      title: 'Image / GIF',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.kind === 'video',
      validation: (rule) =>
        rule.custom((value, context) => {
          const kind = (context.parent as { kind?: string } | undefined)?.kind
          if (kind !== 'video' && !value) {
            return 'An image or GIF file is required'
          }
          return true
        })
    }),
    defineField({
      name: 'videoFile',
      title: 'Video file',
      type: 'file',
      options: { accept: 'video/*' },
      hidden: ({ parent }) => parent?.kind !== 'video',
      validation: (rule) =>
        rule.custom((value, context) => {
          const kind = (context.parent as { kind?: string } | undefined)?.kind
          if (kind === 'video' && !value) {
            return 'A video file is required'
          }
          return true
        })
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string'
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
      description: 'Drives ordering in the archive (newest first).',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'credit',
      title: 'Credit',
      type: 'string',
      description: 'Photographer / source credit line.'
    }),
    defineField({
      name: 'alt',
      title: 'Alt text',
      type: 'string',
      description: 'Describes the media for screen readers.'
    })
  ],
  orderings: [
    {
      title: 'Date, newest first',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }]
    }
  ],
  preview: {
    select: {
      title: 'caption',
      kind: 'kind',
      media: 'image',
      date: 'date'
    },
    prepare({ title, kind, media, date }) {
      const label =
        typeof date === 'string' ? new Date(date).toLocaleDateString() : ''
      return {
        title: title || '(untitled)',
        subtitle: [kind, label].filter(Boolean).join(' · '),
        media
      }
    }
  }
})
