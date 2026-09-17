import React, { useState } from 'react';
import { X, Mail, Copy, Check, Send, Sparkles, MessageSquare, Lightbulb } from 'lucide-react';
import { AppleLiquidLogo } from './AppleLiquidLogo';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const email = 'saurabhmeena5684@gmail.com';

  if (!isOpen) return null;

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80">
          <div className="flex items-center gap-3">
            <AppleLiquidLogo size="sm" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Contact & Suggestions
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Feedback, inquiries & feature suggestions
              </p>
            </div>
          </div>
          <button
            type="button"
            id="close-contact-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Profile & Contact Details Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 dark:from-slate-900 dark:to-indigo-950/30 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            {/* Elegant Monogram Avatar */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0 ring-4 ring-indigo-500/20">
              SM
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Saurabh Meena
              </h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                Developer & Creator
              </p>

              {/* Email Pill Box */}
              <div className="mt-3 inline-flex flex-wrap items-center gap-2 p-1.5 pl-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 shadow-2xs">
                <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="font-mono font-medium truncate max-w-[200px] sm:max-w-none">
                  {email}
                </span>

                <button
                  type="button"
                  id="copy-email-btn"
                  onClick={handleCopyEmail}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:text-indigo-600 dark:hover:text-indigo-300 text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Copy email address"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Suggestion & Feature Request Info Card */}
          <div className="p-4.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-slate-700 dark:text-slate-300 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Suggestions & Custom Features</span>
            </div>

            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              If you have any suggestions to make this tool better, or would like to request a new feature or custom option, feel free to reach out directly via email anytime.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <a
                href={`mailto:${email}?subject=New%20Feature%20Request%20-%20Watermark%20Studio`}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-xs hover:shadow-sm transition-all group cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  New Feature Requests
                </span>
              </a>

              <a
                href={`mailto:${email}?subject=Feedback%20%26%20Improvements%20-%20Watermark%20Studio`}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-cyan-400 dark:hover:border-cyan-500 shadow-xs hover:shadow-sm transition-all group cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  Feedback & Improvements
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <a
            href={`mailto:${email}?subject=Suggestion%20for%20Watermark%20Studio`}
            className="pro-pill-btn px-4 py-2 text-xs font-bold gap-1.5 inline-flex items-center text-slate-900 dark:text-white"
          >
            <Send className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Send Email Directly</span>
          </a>

          <button
            type="button"
            id="close-contact-btn"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
