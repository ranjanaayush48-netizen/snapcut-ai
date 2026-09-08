import React, { useState, useEffect, useRef } from 'react';
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

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 120000;

const unwrap = (response: any) => {
  if (!response) return response;
  if (typeof response === 'object' && 'success' in response && 'data' in response) {
    return response.data;
  }
  if (typeof response === 'object' && 'data' in response) {
    return response.data;
  }
  return response;
};

export const RemoveBgPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [result, setResult] = useState<{ originalUrl: string; outputUrl: string; filename: string } | null>(null);
  const stopPollingRef = useRef(false);

  const { usage, refreshUsage } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    return () => {
      stopPollingRef.current = true;
    };
  }, []);

  const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

  const pollForCompletion = async (jobId: string): Promise<{ jobId: string; inputUrl: string; outputUrl?: string; originalFilename: string; status: string }> => {
    const start = Date.now();
    stopPollingRef.current = false;
    while (!stopPollingRef.current && Date.now() - start < POLL_TIMEOUT_MS) {
      const res = await apiClient.get(`/jobs/${jobId}`);
      const job = unwrap(res) as any;
      if (!job) {
        await wait(POLL_INTERVAL_MS);
        continue;
      }
      if (job.status === 'completed' || job.status === 'failed') {
        return job;
      }
      await wait(POLL_INTERVAL_MS);
    }
    throw new Error('Processing is taking longer than expected. Please check History for result.');
  };

  const handleProcessImage = async () => {
    if (!selectedFile) return;

    stopPollingRef.current = false;

    try {
      setIsProcessing(true);
      setProcessingError(null);

      const formData = new FormData();
      formData.append('image', selectedFile);

      const submitRes = await apiClient.post('/remove-background', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000
      });

      const submit = unwrap(submitRes) as any;
      if (!submit || !submit.jobId) {
        throw new Error("Couldn't create a processing job. Please try again.");
      }

      if (submit.status === 'completed' && submit.outputUrl) {
        setResult({
          originalUrl: submit.inputUrl,
          outputUrl: submit.outputUrl,
          filename: submit.originalFilename
        });
        await refreshUsage();
        showToast('Background removed successfully!', 'success');
        return;
      }

      const job = await pollForCompletion(submit.jobId);
      if (job.status === 'failed') {
        throw new Error("We couldn't process this image right now. Please try again.");
      }

      setResult({
        originalUrl: job.inputUrl || submit.inputUrl,
        outputUrl: job.outputUrl as string,
        filename: job.originalFilename || submit.originalFilename
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
    stopPollingRef.current = true;
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
