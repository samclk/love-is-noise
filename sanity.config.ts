import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

import { apiVersion, dataset, projectId } from './src/sanity/env'
import { schemaTypes } from './src/sanity/schemas'

export default defineConfig({
  name: 'love-is-noise',
  title: 'Love Is Noise',
  basePath: '/studio',
  projectId,
  dataset,
  schema: {
    types: schemaTypes
  },
  plugins: [structureTool(), visionTool({ defaultApiVersion: apiVersion })]
})
