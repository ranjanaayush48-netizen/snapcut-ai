import React from 'react';
import { Card } from '../components/ui/Card.js';
import { Sparkles, Shield, Cpu, Target } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-white">About SnapCut AI</h1>
        <p className="text-base text-[#AAB3D0] max-w-2xl mx-auto">
          We built SnapCut AI to solve one straightforward problem: removing backgrounds from photos without bloated desktop software or steep monthly subscriptions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#00D9FF]/10 text-[#00D9FF] flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Our Core Mission</h3>
          <p className="text-xs text-[#AAB3D0] leading-relaxed">
            To provide e-commerce entrepreneurs, graphic designers, marketers, and creators with a lightning-fast, one-click tool that produces studio-quality transparent PNG outputs every single time.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#6C3BFF]/20 text-[#D1B8FF] flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Engineered for Precision</h3>
          <p className="text-xs text-[#AAB3D0] leading-relaxed">
            By orchestrating modern neural segmentation models with automated cloud processing pipelines, SnapCut AI extracts challenging hair strands, translucent elements, and complex silhouettes cleanly.
          </p>
        </Card>
      </div>

      <Card className="p-8 space-y-4 bg-[#080B1A]">
        <div className="flex items-center gap-2 text-[#00D9FF] text-sm font-semibold">
          <Shield className="w-5 h-5" />
          Image Privacy and Data Ethics
        </div>
        <p className="text-xs text-[#AAB3D0] leading-relaxed">
          At SnapCut AI, privacy is an engineering priority. We do not permanently retain your photos. Input images and transparent results are held in temporary storage strictly to deliver your download, and are systematically purged according to our 24-hour asset expiration policy. Your media is never sold, shared, or indexed for model training.
        </p>
      </Card>
    </div>
  );
};
