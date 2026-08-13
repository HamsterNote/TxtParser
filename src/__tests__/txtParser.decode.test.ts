import {
  IntermediateDocument,
  IntermediateImage,
  IntermediatePage,
  IntermediatePageMap,
  IntermediateParagraph,
  IntermediateText,
  TextDir
} from '@hamster-note/types'
import { TxtParser } from '../index'

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

describe('TxtParser decode', () => {
  it('decodes a deterministic intermediate document back into UTF-8 bytes', async () => {
    const source = 'Hello, world!'
    const doc = await TxtParser.encode(new TextEncoder().encode(source))
    const decoded = await TxtParser.decode(doc)
    const text = new TextDecoder('utf-8').decode(decoded)
    expect(text).toBe(source)
  })

  it('round-trips multiline text', async () => {
    const source = 'Line 1\nLine 2\n你好'
    const doc = await TxtParser.encode(new TextEncoder().encode(source))
    const decoded = await TxtParser.decode(doc)
    const text = new TextDecoder('utf-8').decode(decoded)
    expect(text).toBe(source)
  })

  it.each([
    ['CRLF', 'Line 1\r\nLine 2\r\n'],
    ['CR', 'Line 1\rLine 2\r'],
    ['mixed', 'Line 1\r\nLine 2\rLine 3\n']
  ])('round-trips %s line endings exactly', async (_name, source) => {
    const doc = await TxtParser.encode(new TextEncoder().encode(source))
    const decoded = await TxtParser.decode(doc)
    const text = new TextDecoder('utf-8').decode(decoded)
    expect(text).toBe(source)
  })

  it('round-trips empty text', async () => {
    const doc = await TxtParser.encode(new TextEncoder().encode(''))
    const decoded = await TxtParser.decode(doc)
    const text = new TextDecoder('utf-8').decode(decoded)
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
    const text = new TextDecoder('utf-8').decode(decoded)
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
    const text = new TextDecoder('utf-8').decode(decoded)
    expect(text).toBe('你好TXT')
  })

  it('decodes fully covered paragraphs in paragraph order', async () => {
    const textA = createIntermediateText('text-a', 'A')
    const textB = createIntermediateText('text-b', 'B')
    const page = new IntermediatePage({
      id: 'ordered-paragraph-page',
      number: 1,
      width: 1,
      height: 2,
      content: [textA, textB],
      paragraphs: [
        new IntermediateParagraph({
          id: 'paragraph-b',
          x: 0,
          y: 0,
          width: 1,
          height: 1,
          textIds: ['text-b']
        }),
        new IntermediateParagraph({
          id: 'paragraph-a',
          x: 0,
          y: 1,
          width: 1,
          height: 1,
          textIds: ['text-a']
        })
      ],
      thumbnail: undefined
    })
    const pagesMap = IntermediatePageMap.makeByInfoList([
      {
        id: page.id,
        pageNumber: page.number,
        size: { x: page.width, y: page.height },
        getData: async () => page
      }
    ])
    const doc = new IntermediateDocument({
      id: 'ordered-paragraph-doc',
      title: 'Ordered Paragraphs',
      outline: undefined,
      pagesMap
    })

    const decoded = await TxtParser.decode(doc)
    const text = new TextDecoder('utf-8').decode(decoded)
    expect(text).toBe('B\nA')
  })

  it('falls back to content order when paragraphs do not cover every text', async () => {
    const textA = createIntermediateText('text-a', 'A')
    const orphanText = createIntermediateText('orphan-text', 'X')
    const textB = createIntermediateText('text-b', 'B')
    const page = new IntermediatePage({
      id: 'partial-paragraph-page',
      number: 1,
      width: 3,
      height: 1,
      content: [textA, orphanText, textB],
      paragraphs: [
        new IntermediateParagraph({
          id: 'paragraph-a',
          x: 0,
          y: 0,
          width: 1,
          height: 1,
          textIds: ['text-a']
        }),
        new IntermediateParagraph({
          id: 'paragraph-b',
          x: 2,
          y: 0,
          width: 1,
          height: 1,
          textIds: ['text-b']
        })
      ],
      thumbnail: undefined
    })
    const pagesMap = IntermediatePageMap.makeByInfoList([
      {
        id: page.id,
        pageNumber: page.number,
        size: { x: page.width, y: page.height },
        getData: async () => page
      }
    ])
    const doc = new IntermediateDocument({
      id: 'partial-paragraph-doc',
      title: 'Partial Paragraph Coverage',
      outline: undefined,
      pagesMap
    })

    const decoded = await TxtParser.decode(doc)
    const text = new TextDecoder('utf-8').decode(decoded as ArrayBuffer)
    expect(text).toBe('AXB')
  })
})
