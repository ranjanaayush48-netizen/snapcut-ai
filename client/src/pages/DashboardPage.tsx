import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UsageCard } from '../components/dashboard/UsageCard.js';
import { RecentJobsList } from '../components/dashboard/RecentJobsList.js';
import { UploadDropzone } from '../components/upload/UploadDropzone.js';
import { ProcessingStatus } from '../components/processing/ProcessingStatus.js';
import { BeforeAfterViewer } from '../components/result/BeforeAfterViewer.js';
import { DownloadAction } from '../components/result/DownloadAction.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { useAuth } from '../contexts/AuthContext.js';
import { useToast } from '../contexts/ToastContext.js';
import { apiClient } from '../api/client.js';
import { ProcessingJob } from '../types/index.js';
import { Sparkles, ArrowRight } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, refreshUsage } = useAuth();
  const { showToast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [result, setResult] = useState<{ originalUrl: string; outputUrl: string; filename: string } | null>(null);
  const [recentJobs, setRecentJobs] = useState<ProcessingJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoadingJobs(true);
      const res = await apiClient.get('/history?limit=5');
      if (res.data?.items) {
        setRecentJobs(res.data.items);
      }
    } catch (err) {
      console.error('Failed to load recent jobs', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleProcess = async () => {
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
      await fetchHistory();
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Personalized Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Hello, <span className="text-gradient-brand">{user?.displayName || 'Creator'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#AAB3D0] mt-1">
            Drop an image below to strip its background in one click.
          </p>
        </div>

        <Link to="/remove-background">
          <Button variant="primary" size="sm" className="shadow-glow-sm">
            <Sparkles className="w-4 h-4 mr-2" /> Dedicated Studio Mode
          </Button>
        </Link>
      </div>

      {/* Main Upload / Remove Background Core Action */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#AAB3D0]">
          Quick Background Removal
        </h2>

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
            onRetry={handleProcess}
          />
        ) : (
          <Card className="p-6 sm:p-8">
            <UploadDropzone
              onFileSelected={file => setSelectedFile(file)}
              selectedFile={selectedFile}
              onClearFile={handleReset}
              onSubmit={handleProcess}
              isLoading={isProcessing}
            />
          </Card>
        )}
      </div>

      {/* Quota & Usage Balance */}
      <UsageCard />

      {/* Recent Processing Results */}
      <RecentJobsList jobs={recentJobs} loading={loadingJobs} />
    </div>
  );
};
