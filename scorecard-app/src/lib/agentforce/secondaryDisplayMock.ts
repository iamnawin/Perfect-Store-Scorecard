import type { AgentforceConfidence, AgentforceSecondaryDisplayAnalysis, VisitType } from '../../types'

function brandFromProductName(productName: string) {
  const firstToken = productName.trim().split(/\s+/)[0] ?? ''
  if (!firstToken) return ''
  return firstToken.replace(/[^A-Za-z0-9-]/g, '')
}

function clampSuggestions<T>(items: T[], max = 6) {
  return items.slice(0, Math.max(0, max))
}

function confidenceForRank(index: number): AgentforceConfidence {
  if (index <= 1) return 'medium'
  return 'low'
}

export interface SecondaryDisplayMockRequest {
  visitType: VisitType
  allowedCatalog: string[]
  retailerOrBanner?: string
  businessUnit?: string
  imageFileName?: string
  audioFileName?: string
}

export function mockSecondaryDisplayAnalysis(request: SecondaryDisplayMockRequest): AgentforceSecondaryDisplayAnalysis {
  const allowedCatalogSet = new Set(request.allowedCatalog.map(item => item.trim()).filter(Boolean))
  const candidates = request.allowedCatalog
    .filter(Boolean)
    .map(name => ({
      productName: name,
      brand: brandFromProductName(name),
      matchedCatalog: allowedCatalogSet.has(name),
    }))

  const topProducts = clampSuggestions(candidates, request.visitType === 'follow-up' ? 4 : 6)

  return {
    analysisStatus: 'success',
    displayType: {
      value: request.imageFileName?.toLowerCase().includes('endcap') ? 'endcap' : 'unknown',
      confidence: request.imageFileName?.toLowerCase().includes('endcap') ? 'medium' : 'low',
    },
    products: topProducts.map((item, index) => ({
      productName: item.productName,
      brand: item.brand,
      matchedCatalog: item.matchedCatalog,
      confidence: confidenceForRank(index),
      quantityEstimate: index === 0 ? 'large' : index <= 2 ? 'medium' : 'small',
      status: 'needs_review',
    })),
    notes: [
      'MVP mode: image/audio understanding is stubbed; suggestions are based on the allowed catalog only.',
      request.audioFileName ? 'Voice note captured (transcription not available in MVP).' : 'No voice note provided.',
      request.retailerOrBanner ? `Context: ${request.retailerOrBanner}${request.businessUnit ? ` | ${request.businessUnit}` : ''}.` : 'Context: not provided.',
    ],
  }
}

