"use client";

import { useState } from "react";
import {
  Building2,
  Users,
  CheckCircle2,
  CreditCard,
  FileText,
  Calendar,
  Sparkles,
  ArrowRight,
} from "lucide-react";

/**
 * Corporate bookings landing page.
 *
 * Lead-gen surface targeted at HR / travel desk / admin teams who book
 * intercity travel for employees. Captures interest with a contact form
 * and pitches the value proposition vs ad-hoc consumer bookings.
 */

const benefits = [
  {
    icon: CreditCard,
    title: "Centralised billing",
    desc: "Monthly invoice with GST, project codes, and per-employee breakdown.",
  },
  {
    icon: Users,
    title: "Multi-traveller manifest",
    desc: "Book 50+ seats in one go. Bulk discount tiers from 10% off.",
  },
  {
    icon: Calendar,
    title: "Recurring travel templates",
    desc: "Save your weekly factory shuttle or off-site routes — book in 2 clicks.",
  },
  {
    icon: FileText,
    title: "Compliance reporting",
    desc: "Per-trip receipts, approval audit trail, and travel-policy enforcement.",
  },
];

export default function CorporatePage() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [employees, setEmployees] = useState("11-50");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@") || !company) return;
    // In production this would POST to /api/corporate/leads
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1a3a8f] via-[#1e3d95] to-[#1a1a2e] text-white overflow-hidden">
        <div className="absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-[#f5c842]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-[#2a52be]/30 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#f5c842] mb-5">
                <Building2 className="h-3 w-3" />
                For Companies
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
                Move your team.
                <br />
                <span className="text-gold-gradient">Move your business.</span>
              </h1>
              <p className="mt-5 text-lg text-white/75 max-w-lg">
                Centralised intercity bus travel for offsites, factory
                shuttles, and field teams — billed monthly, with full audit
                trails and bulk-discount pricing.
              </p>

              <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/80">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Up to <strong className="text-white">22% lower</strong> per trip
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Net-30 billing
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  GST-compliant invoices
                </span>
              </div>
            </div>

            {/* Lead capture form */}
            <div className="relative rounded-2xl bg-white/95 backdrop-blur-sm shadow-2xl shadow-[#1a1a2e]/40 border border-white p-6 sm:p-8 text-gray-900">
              {submitted ? (
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 mb-3">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Got it — talk soon!
                  </h3>
                  <p className="text-sm text-gray-600">
                    Our enterprise team will reach out within one business day
                    with a tailored quote for {company}.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Get a custom quote
                  </h3>

                  <div>
                    <label
                      htmlFor="company"
                      className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5"
                    >
                      Company name
                    </label>
                    <input
                      id="company"
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Acme Pvt. Ltd."
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5"
                    >
                      Work email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="travel@acme.com"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="employees"
                      className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5"
                    >
                      Estimated travellers per month
                    </label>
                    <select
                      id="employees"
                      value={employees}
                      onChange={(e) => setEmployees(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none bg-white"
                    >
                      <option>1-10</option>
                      <option>11-50</option>
                      <option>51-200</option>
                      <option>201-500</option>
                      <option>500+</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1a3a8f] hover:bg-[#142d70] text-white px-5 py-3 text-sm font-bold shadow-lg shadow-[#1a3a8f]/30 transition-all"
                  >
                    Request quote
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <p className="text-[10px] text-gray-500 text-center">
                    Used for sales contact only. We never spam.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e8edf8] text-[#1a3a8f] px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="h-3 w-3" />
            Built for travel desks
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Everything HR &amp; admin teams need
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {benefits.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-[#e8edf8] text-[#1a3a8f] mb-4">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trusted by strip */}
      <section className="bg-[#f8f9fc] border-y border-gray-100 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">
            Trusted by 200+ companies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-gray-300 text-2xl font-extrabold tracking-tight">
            <span>Infosys</span>
            <span>Wipro</span>
            <span>TCS</span>
            <span>Flipkart</span>
            <span>Razorpay</span>
            <span>Zomato</span>
          </div>
          <p className="text-[10px] text-gray-300 mt-3">
            Logos illustrative · Real customer list available on request
          </p>
        </div>
      </section>
    </div>
  );
}
