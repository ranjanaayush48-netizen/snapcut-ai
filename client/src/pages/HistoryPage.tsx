import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { apiClient } from '../api/client.js';
import { ProcessingJob } from '../types/index.js';
import { Download, Sparkles, Clock, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchHistory = async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get(`/history?page=${pageNum}&limit=8`);
      const data = res.data;
      setJobs(data.items || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.total || 0);
      setPage(data.page || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve processing history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(page);
  }, [page]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Processing History
          </h1>
          <p className="text-xs sm:text-sm text-[#AAB3D0]">
            Review, inspect, and re-download your previous background removals
          </p>
        </div>

        <Link to="/remove-background">
          <Button variant="primary" size="sm">
            <Sparkles className="w-4 h-4 mr-2" /> New Background Removal
          </Button>
        </Link>
      </div>

      {/* Content States */}
      {loading ? (
        <Card className="space-y-4">
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 rounded-xl bg-[#080B1A] animate-pulse" />
            ))}
          </div>
        </Card>
      ) : error ? (
        <Card className="text-center py-12 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white mb-1">Failed to load history</h3>
            <p className="text-xs text-[#AAB3D0]">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchHistory(page)}>
            Retry
          </Button>
        </Card>
      ) : jobs.length === 0 ? (
        <Card className="text-center py-16 space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-[#080B1A] border border-[#1C2450] flex items-center justify-center text-[#707B9E] mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">No images processed yet.</h3>
            <p className="text-xs text-[#AAB3D0] max-w-sm mx-auto">
              You haven't removed backgrounds from any photos yet. Upload your first image to get started.
            </p>
          </div>
          <Link to="/remove-background">
            <Button variant="primary" size="md">
              Remove Your First Background
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1C2450] bg-[#080B1A]/80 text-[11px] font-bold uppercase tracking-wider text-[#AAB3D0]">
                    <th className="py-4 px-6">Preview</th>
                    <th className="py-4 px-6">Original File</th>
                    <th className="py-4 px-6">Processed Date</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C2450]/60 text-xs">
                  {jobs.map(job => (
                    <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-6">
                        <div className="w-12 h-12 rounded-lg border border-[#1C2450] bg-[#080B1A] checkerboard-pattern overflow-hidden flex items-center justify-center">
                          <img
                            src={job.outputUrl || job.inputUrl}
                            alt={job.originalFilename}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-6 font-medium text-white max-w-[200px] truncate">
                        {job.originalFilename}
                      </td>
                      <td className="py-3 px-6 text-[#AAB3D0]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#707B9E]" />
                          {new Date(job.createdAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-6">
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
                      </td>
                      <td className="py-3 px-6 text-right">
                        {job.status === 'completed' && job.outputUrl ? (
                          <a
                            href={job.outputUrl}
                            download="snapcut-result.png"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#080B1A] border border-[#1C2450] text-[#00D9FF] hover:border-[#00D9FF] hover:bg-[#0B1026] transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PNG</span>
                          </a>
                        ) : (
                          <span className="text-[#707B9E]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-[#AAB3D0]">
              <p>
                Showing {jobs.length} of {totalItems} jobs
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <span className="px-3 py-1 font-semibold text-white">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
