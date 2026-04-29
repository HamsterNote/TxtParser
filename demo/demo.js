import { TxtParser } from '../dist/index.js'
import { IntermediateDocument } from '@hamster-note/types'

const sourceInput = document.querySelector('[data-role="source-input"]')
const inspectBtn = document.querySelector('[data-action="inspect"]')
const encodeBtn = document.querySelector('[data-action="encode"]')
const decodeBtn = document.querySelector('[data-action="decode"]')
const statusEl = document.querySelector('[data-role="status"]')
const summaryEl = document.querySelector('[data-role="summary"]')
const inspectionOutput = document.querySelector('[data-role="inspection-output"]')
const documentOutput = document.querySelector('[data-role="document-output"]')
const decodeOutput = document.querySelector('[data-role="decode-output"]')

let lastDocument = null

inspectBtn.addEventListener('click', async () => {
  try {
    const text = sourceInput.value
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const result = await TxtParser.inspect(blob)
    inspectionOutput.textContent = JSON.stringify(result, null, 2)
    statusEl.textContent = 'Inspect complete'
    summaryEl.textContent = `Kind: ${result.kind}, Size: ${result.byteLength} bytes`
  } catch (err) {
    statusEl.textContent = `Error: ${err.message}`
  }
})

encodeBtn.addEventListener('click', async () => {
  try {
    const text = sourceInput.value
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const arrayBuffer = await blob.arrayBuffer()
    lastDocument = await TxtParser.encode(arrayBuffer)
    const serialized = await IntermediateDocument.serialize(lastDocument)
    documentOutput.textContent = JSON.stringify(serialized, null, 2)
    statusEl.textContent = 'Encode complete'
    summaryEl.textContent = `Document ID: ${lastDocument.id}, Pages: ${lastDocument.pageCount}`
    decodeBtn.disabled = false
  } catch (err) {
    statusEl.textContent = `Error: ${err.message}`
  }
})

decodeBtn.addEventListener('click', async () => {
  try {
    if (!lastDocument) return
    const arrayBuffer = await TxtParser.decode(lastDocument)
    const text = new TextDecoder('utf-8').decode(arrayBuffer)
    decodeOutput.textContent = text
    statusEl.textContent = 'Decode complete'
    summaryEl.textContent = 'Decoded successfully'
  } catch (err) {
    statusEl.textContent = `Error: ${err.message}`
  }
})
