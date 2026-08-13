import { decodeToString, getTextContents } from '../__testutils__/helpers'
import { TxtParser } from '../index'

describe('TxtParser paragraphs', () => {
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
    const doc = await TxtParser.encode(new TextEncoder().encode('AB\nABCDE'))
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

  it('sets per-line text geometry and stable paragraph text references', async () => {
    const doc = await TxtParser.encode(new TextEncoder().encode('A\n\n猫猫'))
    const page = (await doc.pages)[0]
    const texts = await getTextContents(page)
    expect(texts.map((text) => text.id)).toEqual([
      'txt-parser-text-1',
      'txt-parser-text-2',
      'txt-parser-text-3'
    ])
    expect(texts.map((text) => text.content)).toEqual(['A\n', '\n', '猫猫'])
    expect(texts.map((text) => text.polygon)).toEqual([
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1]
      ],
      [
        [0, 1],
        [0, 1],
        [0, 2],
        [0, 2]
      ],
      [
        [0, 2],
        [2, 2],
        [2, 3],
        [0, 3]
      ]
    ])
    expect(page.paragraphs.map((paragraph) => paragraph.y)).toEqual([0, 1, 2])
    expect(page.paragraphs.map((paragraph) => paragraph.textIds)).toEqual([
      ['txt-parser-text-1'],
      ['txt-parser-text-2'],
      ['txt-parser-text-3']
    ])
  })

  it('decodes using paragraph order', async () => {
    const source = 'Line 1\nLine 2\nLine 3'
    const doc = await TxtParser.encode(new TextEncoder().encode(source))
    const decoded = await TxtParser.decode(doc)
    await expect(decodeToString(decoded)).resolves.toBe(source)
  })
})
