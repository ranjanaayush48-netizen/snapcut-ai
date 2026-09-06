import React, { useState } from 'react';
import { Download, RefreshCw, Shield, Check } from 'lucide-react';
import { Button } from '../ui/Button.js';
import { useToast } from '../../contexts/ToastContext.js';

export interface DownloadActionProps {
  processedUrl: string;
  originalFilename?: string;
  onReset: () => void;
}

export const DownloadAction: React.FC<DownloadActionProps> = ({
  processedUrl,
  originalFilename,
  onReset
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const { showToast } = useToast();

  const handleDownload = async () => {
    try {
      setDownloading(true);

      // Fetch blob or handle data URI
      let blobUrl = processedUrl;
      if (!processedUrl.startsWith('data:')) {
        const res = await fetch(processedUrl);
        if (!res.ok) {
          throw new Error('This result is no longer available. Please process the image again.');
        }
        const blob = await res.blob();
        blobUrl = window.URL.createObjectURL(blob);
      }

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'snapcut-result.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      showToast('Transparent PNG downloaded successfully!', 'success');
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err: any) {
      showToast(
        err.message || 'This result is no longer available. Please process the image again.',
        'error'
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full space-y-4 pt-2">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={handleDownload}
          isLoading={downloading}
          className="w-full sm:w-auto min-w-[220px] shadow-glow-brand"
        >
          {downloadSuccess ? (
            <>
              <Check className="w-5 h-5 mr-2 text-white" />
              Downloaded!
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              Download PNG
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={onReset}
          className="w-full sm:w-auto min-w-[220px]"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Remove Another Background
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-[#707B9E] pt-1">
        <Shield className="w-3.5 h-3.5 text-[#00D9FF]" />
        <span>Output saved as clean alpha transparent PNG. Assets automatically expire in 24 hours.</span>
      </div>
    </div>
  );
};
