import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { COMPANY } from '../../config/company.js';

export interface LegalPageProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const LegalPage: React.FC<LegalPageProps> = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-[#050816]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs text-[#707B9E] hover:text-[#00D9FF] transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to home
          </Link>
        </div>

        <div className="mb-10 sm:mb-12 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0D1330] border border-[#1C2450]">
            <FileText className="w-3.5 h-3.5 text-[#00D9FF]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#AAB3D0]">
              {COMPANY.tradeName} · Legal
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            {title}
          </h1>

          {subtitle ? (
            <p className="text-base sm:text-lg text-[#AAB3D0] max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          ) : null}

          <div className="pt-1 flex flex-wrap items-center gap-4 text-[11px] text-[#707B9E]">
            <span>
              <span className="text-white/80 font-semibold">Effective date:</span> {COMPANY.lastUpdated}
            </span>
            <span className="w-1 h-1 rounded-full bg-[#1C2450]" />
            <span>
              <span className="text-white/80 font-semibold">Website:</span>{' '}
              <a
                href={COMPANY.websiteUrl}
                className="text-[#00D9FF] hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                {COMPANY.websiteUrl.replace(/^https?:\/\//, '')}
              </a>
            </span>
          </div>
        </div>

        <div className="rounded-3xl bg-[#080B1A] border border-[#1C2450]/70 p-6 sm:p-10 shadow-[0_0_0_1px_rgba(108,59,255,0.05),0_20px_60px_-20px_rgba(0,0,0,0.5)] space-y-8">
          {children}
        </div>

        <div className="mt-10 pt-6 border-t border-[#1C2450]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#707B9E]">
          <p>
            © {new Date().getFullYear()} {COMPANY.legalName} · Trade name {COMPANY.tradeName}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <a href={`mailto:${COMPANY.supportEmail}`} className="hover:text-[#00D9FF] transition-colors">
              {COMPANY.supportEmail}
            </a>
            <span className="w-1 h-1 rounded-full bg-[#1C2450]" />
            <span>{COMPANY.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export interface LegalSectionProps {
  title: string;
  children: React.ReactNode;
}

export const LegalSection: React.FC<LegalSectionProps> = ({ title, children }) => {
  return (
    <section className="scroll-mt-24 space-y-3.5 pb-8 last:pb-0 border-b border-[#1C2450]/40 last:border-b-0">
      <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-[#C9CFE6]">
        {children}
      </div>
    </section>
  );
};
