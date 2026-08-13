import { DocumentParser, type ParserInput } from '@hamster-note/document-parser'
import {
  IntermediateDocument,
  IntermediatePage,
  IntermediatePageMap,
  IntermediateParagraph,
  IntermediateText,
  TextDir
} from '@hamster-note/types'
import { isIntermediateTextContent } from './content'
import {
  type DecodeInput,
  decodeDocumentInput,
  parseSerializedDocument
} from './decode'

export { isIntermediateTextContent }

export const TXT_PARSER_PACKAGE_NAME = '@hamster-note/txt-parser' as const

export const txtParserWorkspaceStatus = 'initialized' as const

export type TxtParserInputKind = 'array-buffer' | 'array-buffer-view' | 'blob'

export interface TxtParserInspection {
  byteLength: number
  kind: TxtParserInputKind
  message: string
  mimeType: string
  status: 'txt-supported'
  supportedExtensions: string[]
}

class TxtParserError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'TxtParserError'
  }
}

function isBlob(input: unknown): input is Blob {
  return (
    typeof input === 'object' &&
    input !== null &&
    'type' in input &&
    'size' in input &&
    typeof (input as Blob).size === 'number'
  )
}

function detectInputKind(input: ParserInput): TxtParserInputKind {
  if (isBlob(input)) return 'blob'
  if (input instanceof ArrayBuffer) return 'array-buffer'
  return 'array-buffer-view'
}

function resolveMimeType(input: ParserInput): string {
  if (isBlob(input) && input.type) return input.type
  return 'text/plain'
}

export class TxtParser extends DocumentParser {
  static readonly exts = ['txt'] as const
  static readonly ext = 'txt' as const

  static async inspect(input: ParserInput): Promise<TxtParserInspection> {
    let byteLength: number
    if (isBlob(input)) {
      byteLength = input.size
    } else if (input instanceof ArrayBuffer) {
      byteLength = input.byteLength
    } else {
      byteLength = input.byteLength
    }
    const kind = detectInputKind(input)
    const mimeType = resolveMimeType(input)
    return {
      byteLength,
      kind,
      message:
        'TxtParser 支持 UTF-8 TXT 编码与解码；inspect 不会修改输入内容。',
      mimeType,
      status: 'txt-supported',
      supportedExtensions: ['txt']
    }
  }

  static async encode(input: ParserInput): Promise<IntermediateDocument> {
    try {
      const uint8Array = await DocumentParser.toUint8Array(input)
      const decoder = new TextDecoder('utf-8', { fatal: true })
      const content = decoder.decode(uint8Array)

      const lines = content.split(/\r\n|\r|\n/)
      const lineCount = lines.length
      const longestLineLength = lines.reduce(
        (max, line) => Math.max(max, line.length),
        0
      )
      const width = Math.max(1, longestLineLength)
      const height = Math.max(1, lineCount)

      const texts: IntermediateText[] = []
      const paragraphs: IntermediateParagraph[] = []

      lines.forEach((line, index) => {
        const textId = `txt-parser-text-${index + 1}`
        const paragraphId = `txt-parser-paragraph-${index + 1}`
        const yPosition = index

        const text = new IntermediateText({
          id: textId,
          content: line,
          fontSize: 1,
          fontFamily: 'monospace',
          fontWeight: 400,
          italic: false,
          color: '#000000',
          polygon: [
            [0, yPosition],
            [line.length, yPosition],
            [line.length, yPosition + 1],
            [0, yPosition + 1]
          ],
          lineHeight: 1,
          ascent: 0.8,
          descent: 0.2,
          dir: TextDir.LTR,
          skew: 0,
          isEOL: true
        })

        const paragraph = new IntermediateParagraph({
          id: paragraphId,
          x: 0,
          y: yPosition,
          width: line.length,
          height: 1,
          textIds: [textId]
        })

        texts.push(text)
        paragraphs.push(paragraph)
      })

      const pagesMap = IntermediatePageMap.makeByInfoList([
        {
          id: 'txt-parser-page-1',
          pageNumber: 1,
          size: { x: width, y: height },
          getData: async () =>
            new IntermediatePage({
              id: 'txt-parser-page-1',
              number: 1,
              width,
              height,
              content: texts,
              paragraphs,
              thumbnail: undefined
            })
        }
      ])

      return new IntermediateDocument({
        id: 'txt-parser-document',
        title: 'TXT Document',
        outline: undefined,
        pagesMap
      })
    } catch (error) {
      throw new TxtParserError(
        'TxtParser 编码失败：输入不是有效的 UTF-8 TXT 数据',
        { cause: error }
      )
    }
  }

  static async decode(intermediateDocument: DecodeInput): Promise<ParserInput> {
    try {
      const document =
        intermediateDocument instanceof Uint8Array
          ? parseSerializedDocument(intermediateDocument)
          : intermediateDocument
      const pages = await document.pages
      if (pages.length === 0) {
        throw new TxtParserError('TxtParser 解码失败：中间文档不包含可解码页面')
      }

      return decodeDocumentInput(document)
    } catch (error) {
      if (error instanceof TxtParserError) {
        throw error
      }
      const message = error instanceof Error ? error.message : String(error)
      throw new TxtParserError(`TxtParser 解码失败：${message}`)
    }
  }

  async encode(input: ParserInput): Promise<IntermediateDocument> {
    return TxtParser.encode(input)
  }

  async decode(intermediateDocument: DecodeInput): Promise<ParserInput> {
    return TxtParser.decode(intermediateDocument)
  }
}

export async function inspectTxt(
  input: ParserInput
): Promise<TxtParserInspection> {
  return TxtParser.inspect(input)
}
