import type { IntermediatePage, IntermediateText } from '@hamster-note/types'
import {
  inspectTxt,
  isIntermediateTextContent,
  TXT_PARSER_PACKAGE_NAME,
  TxtParser,
  txtParserWorkspaceStatus
} from '../index'

async function getTextContents(
  page: IntermediatePage
): Promise<IntermediateText[]> {
  const content = await page.getContent()
  return content.filter(isIntermediateTextContent)
}

describe('TxtParser', () => {
  describe('exports', () => {
    it('exports the TxtParser public API', () => {
      expect(TXT_PARSER_PACKAGE_NAME).toBe('@hamster-note/txt-parser')
      expect(txtParserWorkspaceStatus).toBe('initialized')
      expect(TxtParser.ext).toBe('txt')
      expect([...TxtParser.exts]).toEqual(['txt'])
    })
  })

  describe('inspect', () => {
    it('inspects blob and binary input without mutating content', async () => {
      const blob = new Blob(['Hello'], { type: 'text/plain' })
      const result = await TxtParser.inspect(blob)
      expect(result.kind).toBe('blob')
      expect(result.mimeType).toBe('text/plain')
      expect(result.status).toBe('txt-supported')
      expect(result.supportedExtensions).toEqual(['txt'])
      expect(result.byteLength).toBe(5)
    })

    it('inspects ArrayBuffer input', async () => {
      const buffer = new TextEncoder().encode('Hello').buffer
      const result = await TxtParser.inspect(buffer)
      expect(result.kind).toBe('array-buffer')
      expect(result.mimeType).toBe('text/plain')
    })

    it('inspects Uint8Array input', async () => {
      const view = new Uint8Array([65, 66, 67])
      const result = await TxtParser.inspect(view)
      expect(result.kind).toBe('array-buffer-view')
      expect(result.mimeType).toBe('text/plain')
    })

    it('inspectTxt delegates to TxtParser.inspect', async () => {
      const view = new Uint8Array([65])
      const result = await inspectTxt(view)
      expect(result.kind).toBe('array-buffer-view')
    })
  })

  describe('encode', () => {
    it('encodes UTF-8 text into a deterministic intermediate document', async () => {
      const doc = await TxtParser.encode(
        new TextEncoder().encode('Hello, world!')
      )
      expect(doc.id).toBe('txt-parser-document')
      expect(doc.title).toBe('TXT Document')
      const pages = await doc.pages
      expect(pages.length).toBe(1)
      expect(pages[0].id).toBe('txt-parser-page-1')
      const texts = await getTextContents(pages[0])
      expect(texts.length).toBe(1)
      expect(texts[0].content).toBe('Hello, world!')
      expect(texts[0].id).toBe('txt-parser-text-1')
    })

    it('encodes Chinese text', async () => {
      const doc = await TxtParser.encode(new TextEncoder().encode('你好'))
      const texts = await getTextContents((await doc.pages)[0])
      expect(texts[0].content).toBe('你好')
    })

    it('encodes empty content', async () => {
      const doc = await TxtParser.encode(new TextEncoder().encode(''))
      const texts = await getTextContents((await doc.pages)[0])
      expect(texts[0].content).toBe('')
    })

    it('encodes multiline text with one paragraph per line', async () => {
      const doc = await TxtParser.encode(
        new TextEncoder().encode('Line 1\nLine 2')
      )
      const page = (await doc.pages)[0]
      const texts = await getTextContents(page)
      expect(texts.map((text) => text.content)).toEqual(['Line 1\n', 'Line 2'])
      expect(page.paragraphs.map((paragraph) => paragraph.textIds)).toEqual([
        ['txt-parser-text-1'],
        ['txt-parser-text-2']
      ])
    })

    it('accepts UTF-8 BOM', async () => {
      const bom = new Uint8Array([0xef, 0xbb, 0xbf, 0x41])
      const doc = await TxtParser.encode(bom)
      const texts = await getTextContents((await doc.pages)[0])
      expect(texts[0].content).toBe('A')
    })

    it('rejects invalid UTF-8 bytes during encode', async () => {
      const invalid = new Uint8Array([0xc3, 0x28])
      await expect(TxtParser.encode(invalid)).rejects.toThrow(
        'TxtParser 编码失败：'
      )
    })

    it('preserves original error as cause when encode fails', async () => {
      const invalid = new Uint8Array([0xc3, 0x28])
      try {
        await TxtParser.encode(invalid)
        fail('Expected encode to throw')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe(
          'TxtParser 编码失败：输入不是有效的 UTF-8 TXT 数据'
        )
        expect((error as Error).cause).toBeDefined()
      }
    })
  })

  describe('document structure', () => {
    it('has correct geometry and style defaults', async () => {
      const doc = await TxtParser.encode(
        new TextEncoder().encode('Hello\nWorld')
      )
      const pages = await doc.pages
      const page = pages[0]
      expect(page.width).toBe(5)
      expect(page.height).toBe(2)
      expect(page.paragraphs.length).toBe(2)
      expect(page.paragraphs[0].y).toBe(0)
      expect(page.paragraphs[1].y).toBe(1)
      const pageContent = await page.getContent()
      const texts = pageContent.filter(isIntermediateTextContent)
      const text = texts[0]
      expect(text.fontSize).toBe(1)
      expect(text.fontFamily).toBe('monospace')
      expect(text.fontWeight).toBe(400)
      expect(text.italic).toBe(false)
      expect(text.color).toBe('#000000')
      expect(text.lineHeight).toBe(1)
      expect(text.ascent).toBe(0.8)
      expect(text.descent).toBe(0.2)
      expect(text.dir).toBe('ltr')
      expect(text.skew).toBe(0)
      expect(text.isEOL).toBe(true)
    })
  })

  describe('paragraphs', () => {
    it('sets each paragraph geometry from its visible line content', async () => {
      const doc = await TxtParser.encode(
        new TextEncoder().encode('AB\r\n\r\nABCDE')
      )
      const page = (await doc.pages)[0]

      expect(
        page.paragraphs.map(({ x, y, width, height }) => ({
          x,
          y,
          width,
          height
        }))
      ).toEqual([
        { x: 0, y: 0, width: 2, height: 1 },
        { x: 0, y: 1, width: 0, height: 1 },
        { x: 0, y: 2, width: 5, height: 1 }
      ])
    })
  })

  describe('instance methods', () => {
    it('instance encode delegates to static encode', async () => {
      const parser = new TxtParser()
      const doc = await parser.encode(new TextEncoder().encode('Instance test'))
      const texts = await getTextContents((await doc.pages)[0])
      expect(texts[0].content).toBe('Instance test')
    })

    it('instance decode delegates to static decode', async () => {
      const parser = new TxtParser()
      const source = 'Round-trip via instance'
      const doc = await parser.encode(new TextEncoder().encode(source))
      const decoded = await parser.decode(doc)
      const text = new TextDecoder('utf-8').decode(decoded as ArrayBuffer)
      expect(text).toBe(source)
    })
  })
})
