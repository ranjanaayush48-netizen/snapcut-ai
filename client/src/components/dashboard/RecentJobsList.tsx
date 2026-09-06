import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { ProcessingJob } from '../../types/index.js';
import { Download, Sparkles, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export interface RecentJobsListProps {
  jobs: ProcessingJob[];
  loading?: boolean;
}

export const RecentJobsList: React.FC<RecentJobsListProps> = ({ jobs, loading = false }) => {
  if (loading) {
    return (
      <Card className="space-y-4">
        <h3 className="text-base font-bold text-white">Recent Background Removals</h3>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 rounded-xl bg-[#080B1A] animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card className="text-center py-10 space-y-4">
        <div className="w-12 h-12 rounded-xl bg-[#080B1A] border border-[#1C2450] flex items-center justify-center text-[#707B9E] mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white mb-1">No images processed yet.</h4>
          <p className="text-xs text-[#707B9E]">
            Upload your first photo to automatically extract the subject and remove its background.
          </p>
        </div>
        <Link to="/remove-background">
          <Button variant="primary" size="sm">
            Remove Your First Background
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white font-['Plus_Jakarta_Sans']">
          Recent Background Removals
        </h3>
        <Link to="/history" className="text-xs text-[#00D9FF] hover:underline font-semibold">
          View All History →
        </Link>
      </div>

      <div className="divide-y divide-[#1C2450]/60">
        {jobs.slice(0, 5).map(job => (
          <div key={job.id} className="py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-xl border border-[#1C2450] overflow-hidden bg-[#080B1A] checkerboard-pattern shrink-0 flex items-center justify-center">
                <img
                  src={job.outputUrl || job.inputUrl}
                  alt={job.originalFilename}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="truncate">
                <p className="text-sm font-semibold text-white truncate">
                  {job.originalFilename}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#707B9E]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(job.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  {job.durationMs && (
                    <span>• {(job.durationMs / 1000).toFixed(1)}s</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Badge
                variant={
                  job.status === 'completed'
                    ? 'success'
                    : job.status === 'failed'
                    ? 'danger'
                    : 'warning'
                }
              >
                {job.status === 'completed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                {job.status === 'failed' && <AlertCircle className="w-3 h-3 mr-1" />}
                {job.status}
              </Badge>

              {job.status === 'completed' && job.outputUrl && (
                <a
                  href={job.outputUrl}
                  download="snapcut-result.png"
                  className="p-2 rounded-lg bg-[#080B1A] border border-[#1C2450] text-[#AAB3D0] hover:text-white hover:border-[#00D9FF] transition-colors"
                  title="Download PNG"
                >
                  <Download className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
