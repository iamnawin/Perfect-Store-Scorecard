import type { AgentforceSecondaryDisplayAnalysis, VisitType } from '../../types'
import { mockSecondaryDisplayAnalysis } from './secondaryDisplayMock'

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read file.'))
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.readAsDataURL(file)
  })
}

export interface SecondaryDisplayAnalyzeParams {
  visitType: VisitType
  retailerOrBanner: string
  businessUnit: string
  allowedCatalog: string[]
  imageFile: File
  audioFile?: File | null
}

export async function analyzeSecondaryDisplay(params: SecondaryDisplayAnalyzeParams): Promise<AgentforceSecondaryDisplayAnalysis> {
  try {
    const imageDataUrl = await fileToDataUrl(params.imageFile)
    const audioDataUrl = params.audioFile ? await fileToDataUrl(params.audioFile) : null

    const response = await fetch('/api/agentforce/secondary-display', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitType: params.visitType,
        retailerOrBanner: params.retailerOrBanner,
        businessUnit: params.businessUnit,
        allowedCatalog: params.allowedCatalog,
        image: {
          dataUrl: imageDataUrl,
          fileName: params.imageFile.name,
        },
        audio: params.audioFile ? {
          dataUrl: audioDataUrl,
          fileName: params.audioFile.name,
        } : null,
      }),
    })

    if (!response.ok) throw new Error('Backend unavailable')
    return await response.json() as AgentforceSecondaryDisplayAnalysis
  } catch {
    return mockSecondaryDisplayAnalysis({
      visitType: params.visitType,
      allowedCatalog: params.allowedCatalog,
      retailerOrBanner: params.retailerOrBanner,
      businessUnit: params.businessUnit,
      imageFileName: params.imageFile.name,
      audioFileName: params.audioFile?.name,
    })
  }
}

