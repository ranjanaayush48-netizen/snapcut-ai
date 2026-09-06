import React, { useState } from 'react';
import { Card } from '../components/ui/Card.js';
import { Input } from '../components/ui/Input.js';
import { Button } from '../components/ui/Button.js';
import { useToast } from '../contexts/ToastContext.js';
import { Mail, MessageSquare, Clock, Send } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      showToast('Please fill out all fields.', 'error');
      return;
    }
    setSubmitted(true);
    showToast('Your message has been received! Our support team will respond within 24 hours.', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-white">Contact SnapCut AI</h1>
        <p className="text-sm text-[#AAB3D0] max-w-xl mx-auto">
          Have questions regarding billing, enterprise limits, or n8n workflow integration? Get in touch with our team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <Card className="p-5 space-y-2 bg-[#080B1A]">
            <div className="flex items-center gap-2 text-[#00D9FF] text-xs font-bold uppercase">
              <Mail className="w-4 h-4" /> Email Support
            </div>
            <p className="text-xs text-white font-medium">support@snapcut.ai</p>
            <p className="text-[11px] text-[#707B9E]">Direct replies from technical team</p>
          </Card>

          <Card className="p-5 space-y-2 bg-[#080B1A]">
            <div className="flex items-center gap-2 text-[#6C3BFF] text-xs font-bold uppercase">
              <Clock className="w-4 h-4" /> Response Time
            </div>
            <p className="text-xs text-white font-medium">Within 24 Hours</p>
            <p className="text-[11px] text-[#707B9E]">Priority queue for Pro & Business</p>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="p-6 sm:p-8">
            {submitted ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Message Dispatched</h3>
                <p className="text-xs text-[#AAB3D0] max-w-sm mx-auto">
                  Thank you for reaching out. We will review your inquiry and follow up at {email}.
                </p>
                <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Your Name"
                  placeholder="e.g. Maya Sharma"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#AAB3D0]">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Describe your inquiry, bug report, or business requirement..."
                    className="w-full px-4 py-3 rounded-xl bg-[#080B1A] border border-[#1C2450] text-white text-sm focus:border-[#00D9FF] focus:ring-2 focus:ring-[#00D9FF]/20 outline-none"
                    required
                  />
                </div>

                <Button type="submit" variant="primary" size="md" className="w-full shadow-glow-brand">
                  <Send className="w-4 h-4 mr-2" />
                  Send Inquiry
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
