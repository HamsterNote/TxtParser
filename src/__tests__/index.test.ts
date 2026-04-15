import { TXT_PARSER_PACKAGE_NAME, txtParserWorkspaceStatus } from '../index'

describe('txt parser workspace', () => {
  it('exports package metadata without claiming parsing capability', () => {
    expect(TXT_PARSER_PACKAGE_NAME).toBe('@hamster-note/txt-parser')
    expect(txtParserWorkspaceStatus).toBe('initialized')
  })
})
