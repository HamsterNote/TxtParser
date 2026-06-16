import {
  IntermediateDocument,
  IntermediateImage,
  IntermediatePage,
  IntermediatePageMap,
  IntermediateText,
  TextDir
} from '@hamster-note/types'
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

function createIntermediateText(id: string, content: string): IntermediateText {
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
      expect(pages[0].paragraphs.length).toBe(1)
      expect(pages[0].paragraphs[0].textIds).toEqual(['txt-parser-text-1'])
    })

    it('encodes Chinese text', async () => {
      const doc = await TxtParser.encode(new TextEncoder().encode('你好'))
      const page = (await doc.pages)[0]
      const texts = await getTextContents(page)
      expect(texts[0].content).toBe('你好')
      expect(page.paragraphs.length).toBe(1)
    })

    it('encodes empty content', async () => {
      const doc = await TxtParser.encode(new TextEncoder().encode(''))
      const page = (await doc.pages)[0]
      const texts = await getTextContents(page)
      expect(texts[0].content).toBe('')
      expect(page.paragraphs.length).toBe(1)
    })

    it('encodes multiline text with multiple paragraphs', async () => {
      const doc = await TxtParser.encode(
        new TextEncoder().encode('Line 1\nLine 2')
      )
      const page = (await doc.pages)[0]
      const texts = await getTextContents(page)
      expect(texts.length).toBe(2)
      expect(texts[0].content).toBe('Line 1')
      expect(texts[1].content).toBe('Line 2')
      expect(page.paragraphs.length).toBe(2)
      expect(page.paragraphs[0].textIds).toEqual(['txt-parser-text-1'])
      expect(page.paragraphs[1].textIds).toEqual(['txt-parser-text-2'])
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

  describe('decode', () => {
    it('decodes a deterministic intermediate document back into UTF-8 bytes', async () => {
      const source = 'Hello, world!'
      const doc = await TxtParser.encode(new TextEncoder().encode(source))
      const decoded = await TxtParser.decode(doc)
      const text = new TextDecoder('utf-8').decode(decoded as ArrayBuffer)
      expect(text).toBe(source)
    })

    it('round-trips multiline text', async () => {
      const source = 'Line 1\nLine 2\n你好'
      const doc = await TxtParser.encode(new TextEncoder().encode(source))
      const decoded = await TxtParser.decode(doc)
      const text = new TextDecoder('utf-8').decode(decoded as ArrayBuffer)
      expect(text).toBe(source)
    })

    it('round-trips empty text', async () => {
      const doc = await TxtParser.encode(new TextEncoder().encode(''))
      const decoded = await TxtParser.decode(doc)
      const text = new TextDecoder('utf-8').decode(decoded as ArrayBuffer)
      expect(text).toBe('')
    })

    it('throws when decode receives a document with no pages', async () => {
      const doc = new IntermediateDocument({
        id: 'empty',
        title: 'Empty',
        pagesMap: new IntermediatePageMap(),
        outline: undefined
      })
      await expect(TxtParser.decode(doc)).rejects.toThrow(
        'TxtParser 解码失败：中间文档不包含可解码页面'
      )
    })

    it('ignores non-text page content while preserving text order', async () => {
      const textA = createIntermediateText('text-a', 'A')
      const textB = createIntermediateText('text-b', 'B')

      const nonText = new IntermediateImage({
        id: 'image-1',
        src: 'data:image/png;base64,placeholder',
        polygon: [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10]
        ],
        opacity: 1
      })

      const page = new IntermediatePage({
        id: 'mixed-page',
        number: 1,
        width: 10,
        height: 10,
        content: [textA, nonText, textB],
        paragraphs: [],
        thumbnail: undefined
      })

      const pagesMap = IntermediatePageMap.makeByInfoList([
        {
          id: 'mixed-page',
          pageNumber: 1,
          size: { x: 10, y: 10 },
          getData: async () => page
        }
      ])

      const doc = new IntermediateDocument({
        id: 'mixed-doc',
        title: 'Mixed',
        outline: undefined,
        pagesMap
      })

      const decoded = await TxtParser.decode(doc)
      const text = new TextDecoder('utf-8').decode(decoded as ArrayBuffer)
      expect(text).toBe('AB')
    })

    it('does not insert spaces when a page stores each character as a separate text item', async () => {
      const characters = ['你', '好', 'T', 'X', 'T']
      const page = new IntermediatePage({
        id: 'character-page',
        number: 1,
        width: 10,
        height: 10,
        content: characters.map((character, index) =>
          createIntermediateText(`character-${index}`, character)
        ),
        paragraphs: [],
        thumbnail: undefined
      })

      const pagesMap = IntermediatePageMap.makeByInfoList([
        {
          id: 'character-page',
          pageNumber: 1,
          size: { x: 10, y: 10 },
          getData: async () => page
        }
      ])

      const doc = new IntermediateDocument({
        id: 'character-doc',
        title: 'Character Split',
        outline: undefined,
        pagesMap
      })

      const decoded = await TxtParser.decode(doc)
      const text = new TextDecoder('utf-8').decode(decoded as ArrayBuffer)
      expect(text).toBe('你好TXT')
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

  describe('instance methods', () => {
    it('instance encode delegates to static encode', async () => {
      const parser = new TxtParser()
      const doc = await parser.encode(new TextEncoder().encode('Instance test'))
      const page = (await doc.pages)[0]
      const texts = await getTextContents(page)
      expect(texts[0].content).toBe('Instance test')
      expect(page.paragraphs.length).toBe(1)
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

  describe('paragraphs', () => {
    it('creates one paragraph per line', async () => {
      const doc = await TxtParser.encode(
        new TextEncoder().encode('First\nSecond\nThird')
      )
      const page = (await doc.pages)[0]
      expect(page.paragraphs.length).toBe(3)
      expect(page.paragraphs[0].textIds).toEqual(['txt-parser-text-1'])
      expect(page.paragraphs[1].textIds).toEqual(['txt-parser-text-2'])
      expect(page.paragraphs[2].textIds).toEqual(['txt-parser-text-3'])
    })

    it('sets correct paragraph geometry', async () => {
      const doc = await TxtParser.encode(
        new TextEncoder().encode('AB\nABCDE')
      )
      const page = (await doc.pages)[0]
      expect(page.paragraphs[0].x).toBe(0)
      expect(page.paragraphs[0].y).toBe(0)
      expect(page.paragraphs[0].width).toBe(2)
      expect(page.paragraphs[0].height).toBe(1)
      expect(page.paragraphs[1].x).toBe(0)
      expect(page.paragraphs[1].y).toBe(1)
      expect(page.paragraphs[1].width).toBe(5)
      expect(page.paragraphs[1].height).toBe(1)
    })

    it('decodes using paragraph order', async () => {
      const source = 'Line 1\nLine 2\nLine 3'
      const doc = await TxtParser.encode(new TextEncoder().encode(source))
      const decoded = await TxtParser.decode(doc)
      const text = new TextDecoder('utf-8').decode(decoded as ArrayBuffer)
      expect(text).toBe(source)
    })
  })
})
