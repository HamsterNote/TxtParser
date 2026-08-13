import {
  IntermediateDocument,
  IntermediatePage,
  IntermediatePageMap,
  IntermediateParagraph,
  IntermediateText,
  TextDir
} from '@hamster-note/types'
import { TxtParser } from '../index'

function createText(id: string, content: string): IntermediateText {
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

function createPage(
  id: string,
  number: number,
  textContents: readonly string[],
  paragraphTextIds?: readonly (readonly string[])[]
): IntermediatePage {
  const texts = textContents.map((content, index) =>
    createText(`${id}-text-${index + 1}`, content)
  )
  const paragraphs = (paragraphTextIds ?? []).map(
    (textIds, index) =>
      new IntermediateParagraph({
        id: `${id}-paragraph-${index + 1}`,
        x: 0,
        y: index,
        width: 1,
        height: 1,
        textIds: [...textIds]
      })
  )
  return new IntermediatePage({
    id,
    number,
    width: 1,
    height: Math.max(1, texts.length),
    content: texts,
    paragraphs,
    thumbnail: undefined
  })
}

function createDocument(
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
    id: 'compat-document',
    title: 'Compatibility document',
    outline: undefined,
    pagesMap
  })
}

async function decodeText(document: IntermediateDocument): Promise<string> {
  return new TextDecoder('utf-8').decode(await TxtParser.decode(document))
}

describe('TxtParser decode compatibility', () => {
  it.each(['\nB', '\rB', '\r\nB'])(
    'does not duplicate a paragraph-leading line ending in %j',
    async (leadingContent) => {
      const page = createPage(
        'leading-page',
        1,
        ['A', leadingContent],
        [['leading-page-text-1'], ['leading-page-text-2']]
      )

      await expect(decodeText(createDocument([page]))).resolves.toBe(
        `A${leadingContent}`
      )
    }
  )

  it('does not duplicate a line ending already stored at a page boundary', async () => {
    const firstPage = createPage('first-page', 1, ['A\r\n'])
    const secondPage = createPage('second-page', 2, ['B'])

    await expect(
      decodeText(createDocument([firstPage, secondPage]))
    ).resolves.toBe('A\r\nB')
  })

  it('ignores empty pages when joining page text', async () => {
    const firstPage = createPage('first-page', 1, ['A'])
    const emptyPage = createPage('empty-page', 2, [])
    const thirdPage = createPage('third-page', 3, ['B'])

    await expect(
      decodeText(createDocument([firstPage, emptyPage, thirdPage]))
    ).resolves.toBe('A\nB')
  })

  it.each([
    ['unknown id', [['unknown-text']]],
    [
      'duplicate reference',
      [['coverage-page-text-1'], ['coverage-page-text-1']]
    ]
  ])(
    'falls back to content order for %s paragraph coverage',
    async (_name, ids) => {
      const page = createPage('coverage-page', 1, ['A', 'B'], ids)

      await expect(decodeText(createDocument([page]))).resolves.toBe('AB')
    }
  )

  it('falls back to content order when text ids are duplicated', async () => {
    const duplicateA = createText('duplicate-id', 'A')
    const duplicateB = createText('duplicate-id', 'B')
    const page = new IntermediatePage({
      id: 'duplicate-page',
      number: 1,
      width: 2,
      height: 1,
      content: [duplicateA, duplicateB],
      paragraphs: [
        new IntermediateParagraph({
          id: 'duplicate-paragraph',
          x: 0,
          y: 0,
          width: 2,
          height: 1,
          textIds: ['duplicate-id', 'duplicate-id']
        })
      ],
      thumbnail: undefined
    })

    await expect(decodeText(createDocument([page]))).resolves.toBe('AB')
  })
})
