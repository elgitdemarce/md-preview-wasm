import * as markdown from 'markdown-wasm'
import './style.css'

const markdownReady = (markdown as unknown as { ready: Promise<void> }).ready

const dropzone = document.querySelector<HTMLElement>('#dropzone')!
const preview = document.querySelector<HTMLElement>('#preview')!
const content = document.querySelector<HTMLElement>('#content')!
const filenameEl = document.querySelector<HTMLElement>('#filename')!
const statsEl = document.querySelector<HTMLElement>('#stats')!
const statusEl = document.querySelector<HTMLElement>('#status')!
const pickBtn = document.querySelector<HTMLButtonElement>('#pick')!
const closeBtn = document.querySelector<HTMLButtonElement>('#close')!
const fileInput = document.querySelector<HTMLInputElement>('#file')!

function render(bytes: Uint8Array, name: string): void {
  const t0 = performance.now()
  const html = markdown.parse(bytes)
  const t1 = performance.now()

  content.innerHTML = html
  filenameEl.textContent = name
  statsEl.textContent = `${(bytes.length / 1024).toFixed(1)} KB · ${(t1 - t0).toFixed(2)} ms`

  dropzone.classList.add('hidden')
  preview.classList.remove('hidden')
  window.scrollTo({ top: 0 })
}

function showDropzone(): void {
  preview.classList.add('hidden')
  dropzone.classList.remove('hidden')
  content.innerHTML = ''
  fileInput.value = ''
}

async function handleFile(file: File): Promise<void> {
  if (!file.name.match(/\.(md|markdown|mdown)$/i) && file.type !== 'text/markdown') {
    statusEl.textContent = 'Ese archivo no parece ser Markdown.'
    return
  }
  const bytes = new Uint8Array(await file.arrayBuffer())
  render(bytes, file.name)
}

pickBtn.addEventListener('click', () => fileInput.click())
closeBtn.addEventListener('click', showDropzone)

fileInput.addEventListener('change', () => {
  const file = fileInput.files?.[0]
  if (file) void handleFile(file)
})

;['dragenter', 'dragover'].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault()
    dropzone.classList.add('dragging')
  }),
)

;['dragleave', 'drop'].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault()
    dropzone.classList.remove('dragging')
  }),
)

dropzone.addEventListener('drop', (e) => {
  const file = e.dataTransfer?.files[0]
  if (file) void handleFile(file)
})

// Prevent the browser from navigating when a file is dropped outside the zone.
window.addEventListener('dragover', (e) => e.preventDefault())
window.addEventListener('drop', (e) => e.preventDefault())

async function init(): Promise<void> {
  try {
    await markdownReady
    statusEl.textContent = 'Motor listo · arrastrá un archivo para empezar'
    statusEl.classList.add('ok')
  } catch (err) {
    console.error(err)
    statusEl.textContent = 'No se pudo cargar WebAssembly en este navegador.'
  }
}

void init()
