import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPluginRegistration } from '@embedpdf/core'
import { EmbedPDF } from '@embedpdf/core/react'
import { usePdfiumEngine } from '@embedpdf/engines/react'
import { DocumentContent, DocumentManagerPluginPackage } from '@embedpdf/plugin-document-manager/react'
import { Viewport, ViewportPluginPackage } from '@embedpdf/plugin-viewport/react'
import { Scroller, ScrollPluginPackage, useScroll } from '@embedpdf/plugin-scroll/react'
import { RenderLayer, RenderPluginPackage } from '@embedpdf/plugin-render/react'
import { InteractionManagerPluginPackage, PagePointerProvider } from '@embedpdf/plugin-interaction-manager/react'
import { SelectionLayer, SelectionPluginPackage, useSelectionCapability } from '@embedpdf/plugin-selection/react'
import { ZoomMode, ZoomPluginPackage, useZoom } from '@embedpdf/plugin-zoom/react'
import { Languages, Loader2, MessageCircleQuestion, Copy, Minus, Plus, MoveHorizontal } from 'lucide-react'
import { useI18n } from '../i18n'

export interface SelectionAction {
  kind: 'explain' | 'translate' | 'copy'
  text: string
}

export interface PdfViewerHandle {
  /** Scroll the viewer to a 1-based page number (e.g. from a citation click). */
  scrollToPage: (page: number) => void
}

interface Props {
  /** URL of the PDF to display. */
  url: string
  /** Called when the user picks Explain/Translate on a text selection. */
  onSelectionAction?: (action: SelectionAction) => void
  /** 1-based page to scroll to once the document has loaded. */
  initialPage?: number
  /** Extra buttons appended to the floating toolbar (e.g. fullscreen). */
  extraControls?: ReactNode
}

/**
 * Headless EmbedPDF viewer with text selection, a floating Explain /
 * Translate / Copy menu and a zoom toolbar. Opens at fit-width.
 */
const PdfViewer = forwardRef<PdfViewerHandle, Props>(function PdfViewer({ url, onSelectionAction, initialPage, extraControls }, ref) {
  const { t } = useI18n()
  const { engine, isLoading, error } = usePdfiumEngine()

  const plugins = useMemo(
    () => [
      createPluginRegistration(DocumentManagerPluginPackage, {
        initialDocuments: [{ url, name: url.split('/').pop() }],
      }),
      createPluginRegistration(ViewportPluginPackage),
      createPluginRegistration(ScrollPluginPackage),
      createPluginRegistration(RenderPluginPackage),
      createPluginRegistration(InteractionManagerPluginPackage),
      createPluginRegistration(SelectionPluginPackage),
      createPluginRegistration(ZoomPluginPackage, { defaultZoomLevel: ZoomMode.FitWidth }),
    ],
    [url],
  )

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-rose-600">
        {String(error.message ?? error)}
      </div>
    )
  }
  if (isLoading || !engine) {
    return (
      <div className="flex h-full items-center justify-center gap-2 p-8 text-sm text-ink-400">
        <Loader2 className="h-4 w-4 animate-spin" /> {t.app.docViewer.loadingEngine}
      </div>
    )
  }

  return (
    <EmbedPDF engine={engine} plugins={plugins}>
      {({ activeDocumentId }) =>
        activeDocumentId ? (
          <DocumentContent documentId={activeDocumentId}>
            {({ isLoaded }) =>
              isLoaded ? (
                <ViewerBody
                  documentId={activeDocumentId}
                  onSelectionAction={onSelectionAction}
                  initialPage={initialPage}
                  extraControls={extraControls}
                  handleRef={ref}
                />
              ) : (
                <div className="flex h-full items-center justify-center gap-2 p-8 text-sm text-ink-400">
                  <Loader2 className="h-4 w-4 animate-spin" /> {t.app.docViewer.loadingEngine}
                </div>
              )
            }
          </DocumentContent>
        ) : null
      }
    </EmbedPDF>
  )
})

export default PdfViewer

function ViewerBody({
  documentId,
  onSelectionAction,
  initialPage,
  extraControls,
  handleRef,
}: {
  documentId: string
  onSelectionAction?: (action: SelectionAction) => void
  initialPage?: number
  extraControls?: ReactNode
  handleRef: React.ForwardedRef<PdfViewerHandle>
}) {
  const { t } = useI18n()
  const { provides: selection } = useSelectionCapability()
  const { provides: scroll, state: scrollState } = useScroll(documentId)
  const { provides: zoom, state: zoomState } = useZoom(documentId)
  const wrapRef = useRef<HTMLDivElement>(null)
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const [menu, setMenu] = useState<{ x: number; y: number; text: string } | null>(null)

  useImperativeHandle(
    handleRef,
    () => ({
      scrollToPage: (page: number) => scroll?.scrollToPage({ pageNumber: page, behavior: 'smooth' }),
    }),
    [scroll],
  )

  // Deep links (?page=N) and cross-document citations land on the right page.
  // Scrolling before the pages are laid out (or before fit-width zoom settles)
  // is silently lost, so retry a few times until the viewer is on the page.
  const pageNow = useRef(scrollState.currentPage)
  pageNow.current = scrollState.currentPage
  const totalPages = scrollState.totalPages
  const ready = totalPages > 0
  useEffect(() => {
    if (!ready || !initialPage || initialPage <= 1 || !scroll) return
    const page = Math.min(initialPage, totalPages)
    let tries = 0
    const id = setInterval(() => {
      if (pageNow.current === page || ++tries > 16) return clearInterval(id)
      scroll.scrollToPage({ pageNumber: page })
    }, 250)
    return () => clearInterval(id)
    // totalPages is only read once the document is ready.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scroll, initialPage, ready])

  // Track where the pointer last was inside the viewer so the floating menu
  // can appear next to the finished selection.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const onPointer = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      pointerRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    el.addEventListener('pointerup', onPointer)
    el.addEventListener('pointermove', onPointer)
    return () => {
      el.removeEventListener('pointerup', onPointer)
      el.removeEventListener('pointermove', onPointer)
    }
  }, [])

  useEffect(() => {
    if (!selection) return
    const scope = selection.forDocument(documentId)
    const offEnd = scope.onEndSelection(() => {
      scope.getSelectedText().wait(
        (lines) => {
          const text = lines.join('\n').trim()
          if (!text) return
          const el = wrapRef.current
          const { x, y } = pointerRef.current
          const width = el?.clientWidth ?? 600
          setMenu({
            x: Math.min(Math.max(x, 90), width - 130),
            y: Math.max(y - 48, 8),
            text,
          })
        },
        () => {},
      )
    })
    const offChange = scope.onSelectionChange((sel) => {
      if (!sel) setMenu(null)
    })
    return () => {
      offEnd()
      offChange()
    }
  }, [selection, documentId])

  const act = (kind: SelectionAction['kind']) => {
    if (!menu) return
    if (kind === 'copy') {
      navigator.clipboard?.writeText(menu.text).catch(() => {})
    } else {
      onSelectionAction?.({ kind, text: menu.text })
    }
    selection?.clear(documentId)
    setMenu(null)
  }

  const pct = Math.round((zoomState?.currentZoomLevel ?? 1) * 100)

  return (
    <div ref={wrapRef} className="relative h-full">
      <Viewport documentId={documentId} className="h-full overflow-auto bg-ink-100">
        <Scroller
          documentId={documentId}
          renderPage={({ width, height, pageIndex }) => (
            <PagePointerProvider documentId={documentId} pageIndex={pageIndex}>
              <div style={{ width, height }} className="bg-surface shadow-sm">
                <RenderLayer documentId={documentId} pageIndex={pageIndex} />
                <SelectionLayer documentId={documentId} pageIndex={pageIndex} />
              </div>
            </PagePointerProvider>
          )}
        />
      </Viewport>

      {/* Zoom toolbar */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center overflow-hidden rounded-xl border border-ink-200 bg-surface/95 shadow-lg backdrop-blur">
        <ToolbarButton label={t.app.docViewer.zoomOut} onClick={() => zoom?.zoomOut()}>
          <Minus className="h-4 w-4" />
        </ToolbarButton>
        <button
          onClick={() => zoom?.requestZoom(ZoomMode.FitWidth)}
          title={t.app.docViewer.fitWidth}
          className="min-w-[3.5rem] px-1 py-2 text-center text-xs font-semibold tabular-nums text-ink-600 transition hover:bg-ink-50"
        >
          {pct}%
        </button>
        <ToolbarButton label={t.app.docViewer.zoomIn} onClick={() => zoom?.zoomIn()}>
          <Plus className="h-4 w-4" />
        </ToolbarButton>
        <div className="h-6 w-px bg-ink-100" />
        <ToolbarButton label={t.app.docViewer.fitWidth} onClick={() => zoom?.requestZoom(ZoomMode.FitWidth)}>
          <MoveHorizontal className="h-4 w-4" />
        </ToolbarButton>
        {scrollState.totalPages > 0 && (
          <>
            <div className="h-6 w-px bg-ink-100" />
            <span className="px-2.5 text-xs tabular-nums text-ink-400">
              {scrollState.currentPage} / {scrollState.totalPages}
            </span>
          </>
        )}
        {extraControls}
      </div>

      {menu && (
        <div
          className="fade-up absolute z-30 flex -translate-x-1/2 items-center overflow-hidden rounded-xl border border-ink-200 bg-surface shadow-xl"
          style={{ left: menu.x, top: menu.y }}
        >
          <MenuButton icon={MessageCircleQuestion} label={t.app.docViewer.explain} onClick={() => act('explain')} />
          <div className="h-6 w-px bg-ink-100" />
          <MenuButton icon={Languages} label={t.app.docViewer.translate} onClick={() => act('translate')} />
          <div className="h-6 w-px bg-ink-100" />
          <MenuButton icon={Copy} label={t.app.docViewer.copy} onClick={() => act('copy')} />
        </div>
      )}
    </div>
  )
}

function ToolbarButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex items-center px-2.5 py-2 text-ink-600 transition hover:bg-ink-50 hover:text-ink-900"
    >
      {children}
    </button>
  )
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Copy
  label: string
  onClick: () => void
}) {
  return (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-ink-700 transition hover:bg-brand-50 hover:text-brand-700"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}
