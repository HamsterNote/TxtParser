import {
  IntermediateDocument,
  IntermediateImage,
  IntermediatePage,
  IntermediatePageMap
} from '@hamster-note/types'
import {
  createDocument,
  createIntermediateText,
  createLineParagraph,
  decodeToString
} from '../__testutils__/helpers'
import { TxtParser } from '../index'

describe('TxtParser decode', () => {
  it('decodes a deterministic intermediate document back into UTF-8 bytes', async () => {
    const source = 'Hello, world!'
    const doc = await TxtParser.encode(new TextEncoder().encode(source))
    const decoded = await TxtParser.decode(doc)
    await expect(decodeToString(decoded)).resolves.toBe(source)
  })

  it('round-trips multiline text', async () => {
    const source = 'Line 1\nLine 2\n你好'
    const doc = await TxtParser.encode(new TextEncoder().encode(source))
    const decoded = await TxtParser.decode(doc)
    await expect(decodeToString(decoded)).resolves.toBe(source)
  })

  it('decodes a UTF-8 serialized intermediate document byte array', async () => {
    const source = 'Serialized\nDocument'
    const doc = await TxtParser.encode(new TextEncoder().encode(source))
    const serialized = await IntermediateDocument.serialize(doc)
    const input = new TextEncoder().encode(JSON.stringify(serialized))
    const decoded = await TxtParser.decode(input)
    await expect(decodeToString(decoded)).resolves.toBe(source)
  })

  it('round-trips empty middle lines and a trailing newline', async () => {
    const source = 'Line 1\n\nLine 3\n'
    const doc = await TxtParser.encode(new TextEncoder().encode(source))
    const decoded = await TxtParser.decode(doc)
    await expect(decodeToString(decoded)).resolves.toBe(source)
  })

  it('normalizes CRLF and lone CR input to LF during encode decode', async () => {
    const source = 'Line 1\r\nLine 2\rLine 3\r\n'
    const doc = await TxtParser.encode(new TextEncoder().encode(source))
    const decoded = await TxtParser.decode(doc)
    await expect(decodeToString(decoded)).resolves.toBe(
      'Line 1\nLine 2\nLine 3\n'
    )
  })

  it('round-trips empty text', async () => {
    const doc = await TxtParser.encode(new TextEncoder().encode(''))
    const decoded = await TxtParser.decode(doc)
    await expect(decodeToString(decoded)).resolves.toBe('')
  })

  it('uses legacy text joining when paragraphs are absent', async () => {
    const page = new IntermediatePage({
      id: 'legacy-page',
      number: 1,
      width: 20,
      height: 1,
      content: [
        createIntermediateText('legacy-text-a', 'Legacy'),
        createIntermediateText('legacy-text-b', 'Join')
      ],
      paragraphs: [],
      thumbnail: undefined
    })
    const doc = createDocument('legacy-doc', 'Legacy', [page])
    const decoded = await TxtParser.decode(doc)
    await expect(decodeToString(decoded)).resolves.toBe('LegacyJoin')
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
      content: [
        createIntermediateText('text-a', 'A'),
        nonText,
        createIntermediateText('text-b', 'B')
      ],
      paragraphs: [],
      thumbnail: undefined
    })
    const decoded = await TxtParser.decode(createDocument('mixed-doc', 'Mixed', [page]))
    await expect(decodeToString(decoded)).resolves.toBe('AB')
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
    const decoded = await TxtParser.decode(
      createDocument('character-doc', 'Character Split', [page])
    )
    await expect(decodeToString(decoded)).resolves.toBe('你好TXT')
  })

  it('decodes paragraphs spread across multiple pages as one newline-joined text stream', async () => {
    const pageOne = new IntermediatePage({
      id: 'paginated-page-1',
      number: 1,
      width: 6,
      height: 2,
      content: [
        createIntermediateText('txt-parser-text-1', 'Line 1'),
        createIntermediateText('txt-parser-text-2', '')
      ],
      paragraphs: [createLineParagraph(1, 6), createLineParagraph(2, 0)],
      thumbnail: undefined
    })
    const pageTwo = new IntermediatePage({
      id: 'paginated-page-2',
      number: 2,
      width: 6,
      height: 2,
      content: [
        createIntermediateText('txt-parser-text-3', 'Line 3'),
        createIntermediateText('txt-parser-text-4', '')
      ],
      paragraphs: [createLineParagraph(3, 6), createLineParagraph(4, 0)],
      thumbnail: undefined
    })
    const decoded = await TxtParser.decode(
      createDocument('paginated-doc', 'Paginated TXT', [pageOne, pageTwo])
    )
    await expect(decodeToString(decoded)).resolves.toBe('Line 1\n\nLine 3\n')
  })

  it('decodes paginated paragraphs by original line geometry rather than page-local storage order', async () => {
    const pageOne = new IntermediatePage({
      id: 'reordered-page-1',
      number: 1,
      width: 6,
      height: 2,
      content: [
        createIntermediateText('txt-parser-text-1', 'Line 1'),
        createIntermediateText('txt-parser-text-3', 'Line 3')
      ],
      paragraphs: [createLineParagraph(3, 6), createLineParagraph(1, 6)],
      thumbnail: undefined
    })
    const pageTwo = new IntermediatePage({
      id: 'reordered-page-2',
      number: 2,
      width: 6,
      height: 1,
      content: [createIntermediateText('txt-parser-text-2', 'Line 2')],
      paragraphs: [createLineParagraph(2, 6)],
      thumbnail: undefined
    })
    const decoded = await TxtParser.decode(
      createDocument('reordered-doc', 'Reordered TXT', [pageOne, pageTwo])
    )
    await expect(decodeToString(decoded)).resolves.toBe(
      'Line 1\nLine 2\nLine 3'
    )
  })
})
