/** English strings for the PDF viewer (the open build has one language). */
const app = {
  docViewer: {
    back: 'Back',
    chatWithDoc: 'Chat with this document',
    chatPlaceholder: 'Ask about this document…',
    explain: 'Explain',
    translate: 'Translate',
    copy: 'Copy',
    selectionHint: 'Select text in the PDF to explain or translate it.',
    explainPrompt: 'Explain this passage from “{doc}” in plain language. What does it mean in practice, and is there anything to watch out for?\n\n“{text}”',
    translatePrompt: 'Translate this passage from “{doc}” into {language}. Then add one sentence of context about what it regulates.\n\n“{text}”',
    loadingEngine: 'Loading PDF viewer…',
    docNotFound: 'Document not found.',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    fitWidth: 'Fit width',
    fullscreen: 'Full screen',
    exitFullscreen: 'Exit full screen',
    openChat: 'Open the chat',
    closeChat: 'Close',
  },
}
export function useI18n() {
  return { t: { app } }
}
