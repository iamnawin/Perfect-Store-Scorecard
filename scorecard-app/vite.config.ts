import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { mockSecondaryDisplayAnalysis } from './src/lib/agentforce/secondaryDisplayMock.ts'
import type { AgentforceSecondaryDisplayAnalysis } from './src/types/index.ts'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { PreviewServer, ViteDevServer } from 'vite'

function agentforceMockApi() {
  function sendJson(res: ServerResponse, statusCode: number, payload: unknown) {
    res.statusCode = statusCode
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(payload))
  }

  async function readBody(req: IncomingMessage) {
    return await new Promise<string>((resolve, reject) => {
      let body = ''
      req.on('data', (chunk: Buffer) => {
        body += chunk.toString('utf-8')
      })
      req.on('end', () => resolve(body))
      req.on('error', reject)
    })
  }

  const route = '/api/agentforce/secondary-display'

  return {
    name: 'agentforce-mock-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(route, async (req: IncomingMessage, res: ServerResponse) => {
        if (req.method !== 'POST') {
          sendJson(res, 405, { error: 'Method Not Allowed' })
          return
        }

        try {
          const body = await readBody(req)
          const payload = JSON.parse(body || '{}') as {
            visitType?: 'initial' | 'follow-up'
            allowedCatalog?: string[]
            retailerOrBanner?: string
            businessUnit?: string
            image?: { fileName?: string }
            audio?: { fileName?: string } | null
          }

          const analysis = mockSecondaryDisplayAnalysis({
            visitType: payload.visitType === 'follow-up' ? 'follow-up' : 'initial',
            allowedCatalog: payload.allowedCatalog ?? [],
            retailerOrBanner: payload.retailerOrBanner,
            businessUnit: payload.businessUnit,
            imageFileName: payload.image?.fileName,
            audioFileName: payload.audio?.fileName ?? undefined,
          })

          sendJson(res, 200, analysis satisfies AgentforceSecondaryDisplayAnalysis)
        } catch {
          sendJson(res, 400, {
            analysisStatus: 'error',
            displayType: { value: 'unknown', confidence: 'low' },
            products: [],
            notes: ['Invalid request body.'],
          } satisfies AgentforceSecondaryDisplayAnalysis)
        }
      })
    },
    configurePreviewServer(server: PreviewServer) {
      server.middlewares.use(route, async (req: IncomingMessage, res: ServerResponse) => {
        if (req.method !== 'POST') {
          sendJson(res, 405, { error: 'Method Not Allowed' })
          return
        }

        try {
          const body = await readBody(req)
          const payload = JSON.parse(body || '{}') as {
            visitType?: 'initial' | 'follow-up'
            allowedCatalog?: string[]
            retailerOrBanner?: string
            businessUnit?: string
            image?: { fileName?: string }
            audio?: { fileName?: string } | null
          }

          const analysis = mockSecondaryDisplayAnalysis({
            visitType: payload.visitType === 'follow-up' ? 'follow-up' : 'initial',
            allowedCatalog: payload.allowedCatalog ?? [],
            retailerOrBanner: payload.retailerOrBanner,
            businessUnit: payload.businessUnit,
            imageFileName: payload.image?.fileName,
            audioFileName: payload.audio?.fileName ?? undefined,
          })

          sendJson(res, 200, analysis satisfies AgentforceSecondaryDisplayAnalysis)
        } catch {
          sendJson(res, 400, {
            analysisStatus: 'error',
            displayType: { value: 'unknown', confidence: 'low' },
            products: [],
            notes: ['Invalid request body.'],
          } satisfies AgentforceSecondaryDisplayAnalysis)
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), agentforceMockApi()],
})
