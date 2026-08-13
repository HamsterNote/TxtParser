import { IntermediateText } from '@hamster-note/types'

export function isIntermediateTextContent(
  content: unknown
): content is IntermediateText {
  return (
    content instanceof IntermediateText ||
    (typeof content === 'object' &&
      content !== null &&
      'content' in content &&
      typeof (content as { content?: unknown }).content === 'string' &&
      'fontSize' in content &&
      typeof (content as { fontSize?: unknown }).fontSize === 'number' &&
      'fontFamily' in content &&
      typeof (content as { fontFamily?: unknown }).fontFamily === 'string')
  )
}

export function joinPageTextContent(
  texts: readonly IntermediateText[]
): string {
  return texts.map((text) => text.content).join('')
}
