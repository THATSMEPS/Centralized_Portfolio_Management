import React, { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { useSiteSettings } from '../hooks/usePortfolioData';
import { submitEnquiry } from '../api/portfolio';

/**
 * EnquirePage
 * -----------------------------------------------
 * Contact / enquiry form view.
 */
const EnquirePage = () => {
  const { data: settings } = useSiteSettings();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitting(true);
    const result = await submitEnquiry(form);
    setSubmitting(false);
    if (result) {
      setSubmitted(true);
      setForm({ name: '', email: '', message: '' });
    }
  };

  return (
    <div className="min-h-screen pt-40 px-10 lg:px-24 pb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
        {/* Left — Heading */}
        <div className="lg:col-span-5">
          <h2 className="text-[8vw] font-black italic tracking-tighter leading-none mb-12 whitespace-pre-line">
            {settings.enquireTitle}
          </h2>
          <p className="text-gray-400 text-xl font-light mb-12">
            {settings.enquireDescription}
          </p>
        </div>

        {/* Right — Form */}
        <div className="lg:col-span-7">
          <div className="p-12 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-3xl">
            {submitted ? (
              <div className="text-center py-16">
                <CheckCircle size={48} className="mx-auto text-emerald-500 mb-6" />
                <h3 className="text-2xl font-black italic mb-4">Transmission Received</h3>
                <p className="text-gray-400 mb-8">We'll get back to you shortly.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-8 py-3 border border-white/20 rounded-full text-xs font-bold uppercase hover:bg-white/10 transition-colors"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-gray-500">
                      Legal Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-white/5 border-b border-white/10 p-3 focus:border-blue-500 outline-none transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-gray-500">
                      Corporate Email
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-white/5 border-b border-white/10 p-3 focus:border-blue-500 outline-none transition-colors"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase text-gray-500">
                    Project Mission
                  </label>
                  <textarea
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-white/5 border-b border-white/10 p-3 h-32 focus:border-blue-500 outline-none transition-colors"
                    placeholder="Tell us what you're imagining..."
                  />
                </div>

                <div className="pt-8">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-6 bg-white text-black font-black italic uppercase text-lg hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                  >
                    {submitting ? 'Transmitting...' : settings.enquireButtonText} <Send size={20} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnquirePage;
