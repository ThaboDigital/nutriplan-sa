import React, { useEffect } from 'react';
import { ArrowLeft, Scale, AlertTriangle, CreditCard, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface TermsOfServiceProps {
  onBack?: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F4] text-[#17211B] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-[#E8EDE9] text-xs font-black text-[#17211B] hover:bg-[#EAF7EF] hover:text-[#2C854E] transition shadow-2xs active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="NutriPlan SA" className="w-8 h-8 rounded-xl object-cover" />
            <span className="text-sm font-black text-[#17211B]">NutriPlan SA</span>
          </div>
        </div>

        {/* Header Hero */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8EDE9] shadow-2xs space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF7EF] text-[#2C854E] text-[11px] font-black uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" />
            <span>User Agreement & Health Disclaimer</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#17211B]">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-[#6B756C]">
            Effective Date: 1 September 2026 • NutriPlan SA (A Product of Thabo Systems)
          </p>
        </div>

        {/* Medical & Health Disclaimer Banner */}
        <div className="bg-[#FFFDF8] rounded-3xl p-6 border border-[#F2A65A]/40 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-[#C06014] font-black text-sm uppercase tracking-wide">
            <AlertTriangle className="w-5 h-5 text-[#F2A65A] shrink-0" />
            <span>Important Health & Medical Disclaimer</span>
          </div>
          <p className="text-xs sm:text-sm text-[#594231] leading-relaxed">
            NutriPlan SA is a nutritional guidance and meal-planning software application intended for general wellness, fitness, and lifestyle optimization only. <strong>NutriPlan SA and its AI NutriCoach do NOT provide medical diagnosis, treatment, or individualized medical dietary prescriptions.</strong>
          </p>
          <p className="text-xs text-[#594231] leading-relaxed">
            If you have type 1 or 2 diabetes, kidney disease, hypertension, are pregnant, breastfeeding, or taking prescription medication, always consult a qualified South African medical doctor or registered dietitian before undertaking any significant dietary changes.
          </p>
        </div>

        {/* Terms Body */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8EDE9] shadow-2xs space-y-6 text-xs sm:text-sm leading-relaxed text-[#3B453D]">
          {/* Section 1 */}
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-black text-[#17211B] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#17211B] text-[#3FAE68] flex items-center justify-center text-xs">1</span>
              <span>Acceptance of Terms</span>
            </h2>
            <p>
              By accessing, registering for, or using NutriPlan SA (available as a Progressive Web App, mobile application, or web service), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-black text-[#17211B] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#17211B] text-[#3FAE68] flex items-center justify-center text-xs">2</span>
              <span>Pro Subscriptions & PayFast Billing</span>
            </h2>
            <p>
              NutriPlan SA offers both a free tier and optional premium "NutriPlan Pro" subscription plans (Monthly at R69.00 or Annual at R579.00 ZAR).
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li><strong>Billing Currency:</strong> All subscription transactions are billed in South African Rand (ZAR) processed securely through PayFast.</li>
              <li><strong>Automatic Renewal:</strong> Recurring subscriptions renew automatically at the end of each billing cycle unless cancelled prior to the renewal date.</li>
              <li><strong>Cancellation:</strong> You may cancel your active Pro subscription at any time with 1-click in the app. Upon cancellation, you retain Pro access until the conclusion of your current paid period.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-black text-[#17211B] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#17211B] text-[#3FAE68] flex items-center justify-center text-xs">3</span>
              <span>Intellectual Property & Food Database</span>
            </h2>
            <p>
              All proprietary algorithms, UI designs, codebases, custom South African recipe databases, and branding associated with NutriPlan SA are the exclusive intellectual property of <strong>Thabo Systems (Pty) Ltd</strong>. You may not reverse-engineer, redistribute, or scrape our recipe database without prior written consent.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-black text-[#17211B] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#17211B] text-[#3FAE68] flex items-center justify-center text-xs">4</span>
              <span>User Responsibilities & Safe Usage</span>
            </h2>
            <p>
              You agree to provide accurate information regarding your age, weight, and food allergies. You are solely responsible for verifying that recommended ingredients do not contain allergens that could cause you adverse health reactions.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-black text-[#17211B] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#17211B] text-[#3FAE68] flex items-center justify-center text-xs">5</span>
              <span>Governing Law & Dispute Resolution</span>
            </h2>
            <p>
              These Terms shall be governed and interpreted according to the laws of the <strong>Republic of South Africa</strong>. Any disputes arising from the use of NutriPlan SA shall be subject to the jurisdiction of the South African courts.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 pb-6 text-xs text-[#6B756C] space-y-1">
          <p>NutriPlan SA • A product of Thabo Systems (Pty) Ltd</p>
          <p className="text-[10px]">© 2026 Thabo Systems. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};