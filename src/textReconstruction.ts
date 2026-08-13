import type {
  IntermediateParagraph,
  IntermediateText
} from '@hamster-note/types'

function concatenateTextContent(texts: readonly IntermediateText[]): string {
  let content = ''
  for (const text of texts) content += text.content
  return content
}

function startsWithLineEnding(content: string): boolean {
  return content.startsWith('\r') || content.startsWith('\n')
}

function endsWithLineEnding(content: string): boolean {
  return content.endsWith('\r') || content.endsWith('\n')
}

function joinParagraphTexts(paragraphTexts: readonly string[]): string {
  let content = ''
  let previousParagraph = ''
  paragraphTexts.forEach((paragraphText, index) => {
    if (
      index > 0 &&
      !endsWithLineEnding(previousParagraph) &&
      !startsWithLineEnding(paragraphText)
    ) {
      content += '\n'
    }
    content += paragraphText
    previousParagraph = paragraphText
  })
  return content
}

export function reconstructPageText(
  texts: readonly IntermediateText[],
  paragraphs: readonly IntermediateParagraph[]
): string {
  const fallbackContent = concatenateTextContent(texts)
  if (paragraphs.length === 0) return fallbackContent

  const textMap = new Map<string, IntermediateText>()
  for (const text of texts) {
    if (textMap.has(text.id)) return fallbackContent
    textMap.set(text.id, text)
  }

  const referencedTextIds = new Set<string>()
  const paragraphTexts: string[] = []
  let referenceCount = 0
  for (const paragraph of paragraphs) {
    let paragraphText = ''
    for (const textId of paragraph.textIds) {
      const text = textMap.get(textId)
      if (!text || referencedTextIds.has(textId)) return fallbackContent
      referencedTextIds.add(textId)
      referenceCount += 1
      paragraphText += text.content
    }
    paragraphTexts.push(paragraphText)
  }

  if (referenceCount !== texts.length) return fallbackContent
  return joinParagraphTexts(paragraphTexts)
}

export function joinNonEmptyPages(pageTexts: readonly string[]): string {
  let content = ''
  let previousPage = ''
  for (const pageText of pageTexts) {
    if (pageText.length === 0) continue
    if (
      previousPage.length > 0 &&
      !endsWithLineEnding(previousPage) &&
      !startsWithLineEnding(pageText)
    ) {
      content += '\n'
    }
    content += pageText
    previousPage = pageText
  }
  return content
}
