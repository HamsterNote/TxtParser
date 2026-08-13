import {
  IntermediateDocument,
  type IntermediateDocumentSerialized,
  type IntermediatePage,
  type IntermediateParagraph,
  type IntermediateText
} from '@hamster-note/types'
import { isIntermediateTextContent, joinPageTextContent } from './content'

export type DecodeInput = Uint8Array | IntermediateDocument

type ParagraphText = {
  readonly content: string
  readonly order: number
}

export function parseSerializedDocument(input: Uint8Array): IntermediateDocument {
  const decoder = new TextDecoder('utf-8', { fatal: true })
  const data: IntermediateDocumentSerialized = JSON.parse(decoder.decode(input))
  return IntermediateDocument.parse(data)
}

function compareParagraphText(a: ParagraphText, b: ParagraphText): number {
  return a.order - b.order
}

function getParagraphTextOrder(
  paragraph: IntermediateParagraph,
  fallbackOrder: number
): number {
  return Number.isFinite(paragraph.y) ? paragraph.y : fallbackOrder
}

function getParagraphTextContent(
  paragraph: IntermediateParagraph,
  textMap: ReadonlyMap<string, IntermediateText>
): string {
  return paragraph.textIds
    .map((id) => textMap.get(id))
    .filter((text): text is IntermediateText => text !== undefined)
    .map((text) => text.content)
    .join('')
}

function getPageParagraphTexts(
  page: IntermediatePage,
  texts: readonly IntermediateText[],
  pageIndex: number
): readonly ParagraphText[] {
  if (page.paragraphs.length === 0) {
    return [
      {
        content: joinPageTextContent(texts),
        order: pageIndex
      }
    ]
  }

  const textMap = new Map(texts.map((text) => [text.id, text]))
  return page.paragraphs.map((paragraph, index) => ({
    content: getParagraphTextContent(paragraph, textMap),
    order: getParagraphTextOrder(paragraph, pageIndex + index / 1_000_000)
  }))
}

export async function decodeDocumentInput(
  input: DecodeInput
): Promise<ArrayBuffer> {
  const document =
    input instanceof Uint8Array ? parseSerializedDocument(input) : input
  const pages = await document.pages

  const paragraphTexts: ParagraphText[] = []
  for (const [pageIndex, page] of pages.entries()) {
    const content = await page.getContent()
    const texts = content.filter(isIntermediateTextContent)
    paragraphTexts.push(...getPageParagraphTexts(page, texts, pageIndex))
  }

  const text = paragraphTexts
    .sort(compareParagraphText)
    .map((paragraphText) => paragraphText.content)
    .join('\n')
  return new TextEncoder().encode(text).buffer
}
