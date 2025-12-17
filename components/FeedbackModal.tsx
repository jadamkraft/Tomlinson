import React, { useEffect, useMemo, useRef } from "react";
import { useForm, ValidationError } from "@formspree/react";
import { Bug, CheckCircle2, Send, X } from "lucide-react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FORMSPREE_FORM_ID = "xnneklro";

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [state, handleSubmit] = useForm(FORMSPREE_FORM_ID);
  const typeRef = useRef<HTMLSelectElement>(null);

  const context = useMemo(() => {
    const timestamp = new Date().toISOString();
    const url = typeof window !== "undefined" ? window.location.href : "";
    const userAgent =
      typeof navigator !== "undefined" ? navigator.userAgent : "";
    return { timestamp, url, userAgent };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    // Focus the first field after paint
    window.setTimeout(() => typeRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasErrors = state.errors && state.errors.length > 0;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Report a Bug / Feedback"
          className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl"
        >
          <div className="flex items-start justify-between gap-4 border-b border-slate-800 p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-lg bg-sky-600/20 p-2 text-sky-300 border border-sky-900/40">
                <Bug size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-100">
                  Report a Bug / Feedback
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Tell us what went wrong (or what would make Tomlinson better).
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-colors"
              aria-label="Close feedback form"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5">
            {state.succeeded ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-900/40">
                  <CheckCircle2 size={22} />
                </div>
                <h3 className="text-xl font-semibold text-slate-100">
                  Sent. Thank you.
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  We received your message and will review it.
                </p>
                <div className="mt-6 flex items-center justify-center">
                  <button
                    onClick={onClose}
                    className="rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-500 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {hasErrors && (
                  <div className="rounded-xl border border-rose-900/50 bg-rose-950/30 p-4">
                    <p className="text-sm font-semibold text-rose-200">
                      Couldn’t send your message.
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-rose-200/90">
                      {state.errors?.map((err, idx) => (
                        <li key={`${err.field ?? "form"}-${idx}`}>
                          {err.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                      Type
                    </label>
                    <select
                      ref={typeRef}
                      name="type"
                      required
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      defaultValue="Bug"
                    >
                      <option value="Bug">Bug</option>
                      <option value="Feedback">Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="you@domain.com"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                    <ValidationError
                      prefix="Email"
                      field="email"
                      errors={state.errors}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={6}
                    placeholder="What happened? Steps to reproduce? What did you expect to happen?"
                    className="w-full resize-none rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                  <ValidationError
                    prefix="Message"
                    field="message"
                    errors={state.errors}
                  />
                </div>

                {/* Helpful context for triage */}
                <input type="hidden" name="url" value={context.url} />
                <input
                  type="hidden"
                  name="userAgent"
                  value={context.userAgent}
                />
                <input
                  type="hidden"
                  name="timestamp"
                  value={context.timestamp}
                />

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={state.submitting}
                    className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors ${
                      state.submitting
                        ? "bg-sky-700/60 cursor-not-allowed"
                        : "bg-sky-600 hover:bg-sky-500"
                    }`}
                  >
                    {state.submitting ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Send
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
