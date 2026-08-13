import {
  IntermediateDocument,
  type IntermediateDocumentSerialized
} from '@hamster-note/types'
import { isIntermediateTextContent } from './content'
import { joinNonEmptyPages, reconstructPageText } from './textReconstruction'

export type DecodeInput = Uint8Array | IntermediateDocument

export function parseSerializedDocument(input: Uint8Array): IntermediateDocument {
  const decoder = new TextDecoder('utf-8', { fatal: true })
  const data: IntermediateDocumentSerialized = JSON.parse(decoder.decode(input))
  return IntermediateDocument.parse(data)
}

export async function decodeDocumentInput(
  input: DecodeInput
): Promise<ArrayBuffer> {
  const document =
    input instanceof Uint8Array ? parseSerializedDocument(input) : input
  const pages = await document.pages

  const pageTexts: string[] = []
  for (const page of pages) {
    const content = await page.getContent()
    const texts = content.filter(isIntermediateTextContent)
    pageTexts.push(reconstructPageText(texts, page.paragraphs))
  }

  const text = joinNonEmptyPages(pageTexts)
  return new TextEncoder().encode(text).buffer
}
