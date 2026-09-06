import React, { useState } from 'react';
import { UploadDropzone } from '../components/upload/UploadDropzone.js';
import { ProcessingStatus } from '../components/processing/ProcessingStatus.js';
import { BeforeAfterViewer } from '../components/result/BeforeAfterViewer.js';
import { DownloadAction } from '../components/result/DownloadAction.js';
import { Card } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import { useAuth } from '../contexts/AuthContext.js';
import { useToast } from '../contexts/ToastContext.js';
import { apiClient } from '../api/client.js';
import { Sparkles, Shield, Zap } from 'lucide-react';

export const RemoveBgPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [result, setResult] = useState<{ originalUrl: string; outputUrl: string; filename: string } | null>(null);

  const { usage, refreshUsage } = useAuth();
  const { showToast } = useToast();

  const handleProcessImage = async () => {
    if (!selectedFile) return;

    try {
      setIsProcessing(true);
      setProcessingError(null);

      const formData = new FormData();
      formData.append('image', selectedFile);

      const res = await apiClient.post('/remove-background', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const data = res.data;
      setResult({
        originalUrl: data.inputUrl,
        outputUrl: data.outputUrl,
        filename: data.originalFilename
      });

      await refreshUsage();
      showToast('Background removed successfully!', 'success');
    } catch (err: any) {
      setProcessingError(err.message || "We couldn't process this image right now. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setProcessingError(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Studio Background Remover
            </h1>
            <Badge variant="cyan">AI 2.0</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#AAB3D0]">
            Automatic 1-click subject extraction with transparent PNG export
          </p>
        </div>

        {/* Quota Badge */}
        <div className="flex items-center gap-3 text-xs bg-[#080B1A] border border-[#1C2450] px-3.5 py-1.5 rounded-xl">
          <Zap className="w-3.5 h-3.5 text-[#00D9FF]" />
          <span className="text-[#AAB3D0]">
            Daily: <strong className="text-white">{usage?.remainingDaily ?? 5}</strong> left
          </span>
          <span className="text-[#1C2450]">|</span>
          <span className="text-[#AAB3D0]">
            Credits: <strong className="text-white">{usage?.creditBalance ?? 5}</strong>
          </span>
        </div>
      </div>

      {/* Main Studio Work Area */}
      {result ? (
        <Card className="p-6 sm:p-8 space-y-6">
          <BeforeAfterViewer
            originalUrl={result.originalUrl}
            processedUrl={result.outputUrl}
            originalFilename={result.filename}
          />
          <DownloadAction
            processedUrl={result.outputUrl}
            originalFilename={result.filename}
            onReset={handleReset}
          />
        </Card>
      ) : isProcessing || processingError ? (
        <ProcessingStatus
          originalImagePreview={selectedFile ? URL.createObjectURL(selectedFile) : undefined}
          errorMessage={processingError}
          onRetry={handleProcessImage}
        />
      ) : (
        <Card className="p-6 sm:p-10 shadow-2xl">
          <UploadDropzone
            onFileSelected={file => setSelectedFile(file)}
            selectedFile={selectedFile}
            onClearFile={handleReset}
            onSubmit={handleProcessImage}
            isLoading={isProcessing}
          />
        </Card>
      )}

      {/* Retention Notice */}
      <div className="text-center text-xs text-[#707B9E] flex items-center justify-center gap-2">
        <Shield className="w-3.5 h-3.5 text-[#00D9FF]" />
        <span>Files are retained for 24 hours only. No imagery is retained permanently.</span>
      </div>
    </div>
  );
};
