import {
  IntermediateDocument,
  type IntermediatePage,
  IntermediatePageMap,
  IntermediateParagraph,
  IntermediateText,
  TextDir
} from '@hamster-note/types'
import { isIntermediateTextContent } from '../index'

export async function decodeToString(
  decoded: ArrayBuffer | ArrayBufferView | Blob
): Promise<string> {
  if (decoded instanceof Blob) {
    return decoded.text()
  }
  const bytes = decoded instanceof ArrayBuffer ? decoded : decoded.buffer
  return new TextDecoder('utf-8').decode(bytes)
}

export async function getTextContents(
  page: IntermediatePage
): Promise<IntermediateText[]> {
  const content = await page.getContent()
  return content.filter(isIntermediateTextContent)
}

export function createIntermediateText(
  id: string,
  content: string
): IntermediateText {
  return new IntermediateText({
    id,
    content,
    fontSize: 1,
    fontFamily: 'monospace',
    fontWeight: 400,
    italic: false,
    color: '#000000',
    polygon: [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1]
    ],
    lineHeight: 1,
    ascent: 0.8,
    descent: 0.2,
    dir: TextDir.LTR,
    skew: 0,
    isEOL: true
  })
}

export function createDocument(
  id: string,
  title: string,
  pages: readonly IntermediatePage[]
): IntermediateDocument {
  const pagesMap = IntermediatePageMap.makeByInfoList(
    pages.map((page) => ({
      id: page.id,
      pageNumber: page.number,
      size: { x: page.width, y: page.height },
      getData: async () => page
    }))
  )
  return new IntermediateDocument({
    id,
    title,
    outline: undefined,
    pagesMap
  })
}

export function createLineParagraph(
  lineNumber: number,
  contentWidth: number
): IntermediateParagraph {
  return new IntermediateParagraph({
    id: `txt-parser-paragraph-${lineNumber}`,
    x: 0,
    y: lineNumber - 1,
    width: contentWidth,
    height: 1,
    textIds: [`txt-parser-text-${lineNumber}`]
  })
}
