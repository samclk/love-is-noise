'use client'

import * as React from 'react'
import { Button } from '@/components/Button'
import { STORES } from './config'

type StoreDialogProps = {
  open: boolean
  onClose: () => void
}

/**
 * The region chooser the Merch slide opens.
 *
 * Built on the native <dialog> element rather than a hand-rolled overlay, which
 * hands us the focus trap, Escape to close, inert background and the top layer
 * for free — all things a canvas-drawn panel could not have at any price.
 *
 * The store list reuses the site's existing barbed-wire Button, including its
 * hrefless variant for the store that is not open yet. That component was
 * already built for exactly this list.
 */
export function StoreDialog({ open, onClose }: StoreDialogProps) {
  const ref = React.useRef<HTMLDialogElement>(null)
  const panel = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const dialog = ref.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
      // showModal focuses the first focusable child, which put a ring around the
      // UK store the instant the dialog appeared — as though it had been chosen.
      // Focus moves to the panel instead: still inside the dialog, so the trap
      // and screen-reader announcement are intact, but nothing looks selected.
      // Tabbing from here reaches the stores and rings them properly.
      panel.current?.focus()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby="store-dialog-title"
      // `close` also fires on Escape and on the form below, so this is the one
      // place the parent's state needs syncing back.
      onClose={onClose}
      // Clicking the backdrop means clicking the dialog element itself; anything
      // inside it is a descendant, so this does not swallow the buttons.
      onClick={(event) => {
        if (event.target === ref.current) onClose()
      }}
      className="fixed inset-0 m-auto max-w-lg bg-transparent p-4 backdrop:bg-black/80 backdrop:backdrop-blur-sm"
    >
      {/*
        Focus styling is scoped here rather than added to Button, which is shared
        with the rest of the site. The default ring is bright blue and lands on
        the first store the moment the dialog opens, which is the one place it
        would be most obviously wrong.
      */}
      <div
        ref={panel}
        // Focusable only programmatically, and never ringed itself — it exists as
        // a landing place for focus, not as a control.
        tabIndex={-1}
        className="flex flex-col gap-6 border-2 border-white/15 bg-black p-6 outline-none [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-white"
      >
        <h2
          id="store-dialog-title"
          className="font-styled text-center text-3xl text-white"
        >
          choose your store
        </h2>

        <ul className="flex flex-col gap-4">
          {STORES.map((store) => (
            <li key={store.label}>
              <Button {...store} />
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onClose}
          className="font-styled text-lg text-white/50 underline transition-colors hover:text-white focus-visible:text-white"
        >
          close
        </button>
      </div>
    </dialog>
  )
}
