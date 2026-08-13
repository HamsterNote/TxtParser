import {
  IntermediateDocument,
  IntermediateImage,
  IntermediatePage,
  IntermediatePageMap,
  IntermediateParagraph
} from '@hamster-note/types'
import {
  createDocument,
  createIntermediateText,
  decodeToString
} from '../__testutils__/helpers'
import { TxtParser } from '../index'

describe('TxtParser decode', () => {
  it('decodes a deterministic intermediate document back into UTF-8 bytes', async () => {
    const source = 'Hello, world!'
    const document = await TxtParser.encode(new TextEncoder().encode(source))

    await expect(decodeToString(await TxtParser.decode(document))).resolves.toBe(
      source
    )
  })

  it('decodes a UTF-8 serialized intermediate document byte array', async () => {
    const source = 'Serialized\nDocument'
    const document = await TxtParser.encode(new TextEncoder().encode(source))
    const serialized = await IntermediateDocument.serialize(document)
    const input = new TextEncoder().encode(JSON.stringify(serialized))

    await expect(decodeToString(await TxtParser.decode(input))).resolves.toBe(
      source
    )
  })

  it.each([
    ['LF with empty line and trailing terminator', 'Line 1\n\nLine 3\n'],
    ['CRLF', 'Line 1\r\nLine 2\r\n'],
    ['CR', 'Line 1\rLine 2\r'],
    ['mixed', 'Line 1\r\nLine 2\rLine 3\n']
  ])('round-trips %s exactly', async (_name, source) => {
    const document = await TxtParser.encode(new TextEncoder().encode(source))

    await expect(decodeToString(await TxtParser.decode(document))).resolves.toBe(
      source
    )
  })

  it('round-trips empty text', async () => {
    const document = await TxtParser.encode(new TextEncoder().encode(''))

    await expect(decodeToString(await TxtParser.decode(document))).resolves.toBe(
      ''
    )
  })

  it('throws when decode receives a document with no pages', async () => {
    const document = new IntermediateDocument({
      id: 'empty',
      title: 'Empty',
      pagesMap: new IntermediatePageMap(),
      outline: undefined
    })

    await expect(TxtParser.decode(document)).rejects.toThrow(
      'TxtParser 解码失败：中间文档不包含可解码页面'
    )
  })

  it('ignores non-text page content while preserving text order', async () => {
    const image = new IntermediateImage({
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
        image,
        createIntermediateText('text-b', 'B')
      ],
      paragraphs: [],
      thumbnail: undefined
    })

    const decoded = await TxtParser.decode(
      createDocument('mixed-doc', 'Mixed', [page])
    )
    await expect(decodeToString(decoded)).resolves.toBe('AB')
  })

  it('does not insert spaces between character-sized text items', async () => {
    const page = new IntermediatePage({
      id: 'character-page',
      number: 1,
      width: 10,
      height: 1,
      content: ['你', '好', 'T', 'X', 'T'].map((character, index) =>
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

  it('decodes fully covered paragraphs in paragraph array order', async () => {
    const page = new IntermediatePage({
      id: 'ordered-page',
      number: 1,
      width: 1,
      height: 2,
      content: [
        createIntermediateText('text-a', 'A'),
        createIntermediateText('text-b', 'B')
      ],
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

    const decoded = await TxtParser.decode(
      createDocument('ordered-doc', 'Ordered Paragraphs', [page])
    )
    await expect(decodeToString(decoded)).resolves.toBe('B\nA')
  })

  it('falls back to content order for incomplete paragraph coverage', async () => {
    const page = new IntermediatePage({
      id: 'partial-page',
      number: 1,
      width: 3,
      height: 1,
      content: [
        createIntermediateText('text-a', 'A'),
        createIntermediateText('orphan-text', 'X'),
        createIntermediateText('text-b', 'B')
      ],
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

    const decoded = await TxtParser.decode(
      createDocument('partial-doc', 'Partial Coverage', [page])
    )
    await expect(decodeToString(decoded)).resolves.toBe('AXB')
  })
})
