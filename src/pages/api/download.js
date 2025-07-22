import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import path from 'path'
import fs from 'fs'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const filePath = path.resolve('private/Love-Is-Noise-Century-Media.doc')

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' })
  }

  res.setHeader('Content-Type', 'application/doc')
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="Love-Is-Noise-Century-Media.doc"'
  )

  const fileStream = fs.createReadStream(filePath)
  fileStream.pipe(res)
}
