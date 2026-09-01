import React, { useEffect } from 'react';
import { ArrowLeft, Shield, Lock, Eye, FileText, CheckCircle2, Heart } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack?: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
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
            <Shield className="w-3.5 h-3.5" />
            <span>POPIA Compliant Privacy Policy</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#17211B]">
            Privacy Policy & Data Protection
          </h1>
          <p className="text-xs sm:text-sm text-[#6B756C]">
            Effective Date: 1 September 2026 • Last updated for NutriPlan SA (A Product of Thabo Systems)
          </p>
        </div>

        {/* Content Body */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8EDE9] shadow-2xs space-y-6 text-xs sm:text-sm leading-relaxed text-[#3B453D]">
          {/* Section 1 */}
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-black text-[#17211B] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#17211B] text-[#3FAE68] flex items-center justify-center text-xs">1</span>
              <span>Overview & POPIA Commitment</span>
            </h2>
            <p>
              NutriPlan SA ("we", "us", or "our", operated by <strong>Thabo Systems</strong>, South Africa) is dedicated to protecting your privacy in full compliance with the <strong>Protection of Personal Information Act No. 4 of 2013 (POPIA)</strong> and international data protection standards.
            </p>
            <p>
              This policy explains how we collect, process, safeguard, and respect the health metrics, preferences, and personal data you provide when using our mobile application and web platform.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-black text-[#17211B] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#17211B] text-[#3FAE68] flex items-center justify-center text-xs">2</span>
              <span>Information We Collect</span>
            </h2>
            <div className="space-y-2">
              <div className="p-3.5 rounded-2xl bg-[#F8FBF9] border border-[#EAF7EF]">
                <strong className="text-[#17211B] block">a) Account & Contact Information:</strong>
                <span className="text-xs text-[#6B756C]">
                  Full name, email address, password hash (managed securely via Supabase Auth), and optional cell number for subscription billing notifications.
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F8FBF9] border border-[#EAF7EF]">
                <strong className="text-[#17211B] block">b) Health, Body & Nutrition Metrics:</strong>
                <span className="text-xs text-[#6B756C]">
                  Age, biological sex/gender, current weight (kg), target weight (kg), height (cm), activity level, daily water intake logs, meals eaten, and habit completions.
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F8FBF9] border border-[#EAF7EF]">
                <strong className="text-[#17211B] block">c) Dietary & Budget Preferences:</strong>
                <span className="text-xs text-[#6B756C]">
                  Dietary tier (e.g. Mzansi Budget Banting, Lower-Carb, High Protein), food allergies, avoided items, and weekly ZAR grocery budget targets.
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F8FBF9] border border-[#EAF7EF]">
                <strong className="text-[#17211B] block">d) Payment Transaction Tokens:</strong>
                <span className="text-xs text-[#6B756C]">
                  Payment tokens generated via PayFast South Africa. We never store or process raw credit card numbers on our servers.
                </span>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-black text-[#17211B] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#17211B] text-[#3FAE68] flex items-center justify-center text-xs">3</span>
              <span>How Your Data Is Processed</span>
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li>To calculate your individualized daily caloric and macronutrient targets.</li>
              <li>To generate customized 7-day South African meal plans matching your weekly grocery budget.</li>
              <li>To provide contextual nutrition advice through our AI NutriCoach engine.</li>
              <li>To synchronize your pantry and shopping lists across your mobile devices and web browser.</li>
              <li><strong>We do NOT sell, rent, or trade your personal or health data to third-party advertisers.</strong></li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-black text-[#17211B] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#17211B] text-[#3FAE68] flex items-center justify-center text-xs">4</span>
              <span>Guest Mode & Local Storage</span>
            </h2>
            <p>
              NutriPlan SA allows users to explore and generate meal plans in <strong>Guest Mode</strong> without creating an account. In Guest Mode, all data is retained solely in your local browser storage (IndexedDB/LocalStorage). When you register, you may optionally migrate your local guest logs to your authenticated cloud profile.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-black text-[#17211B] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#17211B] text-[#3FAE68] flex items-center justify-center text-xs">5</span>
              <span>Your POPIA Rights & Data Deletion</span>
            </h2>
            <p>
              Under POPIA, you have the right to request access to your personal data, rectify inaccuracies, or request permanent deletion of your profile and historical logs at any time. You can trigger complete account deletion via the Profile settings tab or by emailing our data officer.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-black text-[#17211B] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#17211B] text-[#3FAE68] flex items-center justify-center text-xs">6</span>
              <span>Contact Us & Information Officer</span>
            </h2>
            <p>
              If you have any questions or data requests regarding this Privacy Policy, please reach out to us:
            </p>
            <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#F0EBE1] text-xs space-y-1">
              <p><strong>Thabo Systems (Pty) Ltd</strong></p>
              <p>Website: <a href="https://www.thabosystems.co.za" target="_blank" rel="noopener noreferrer" className="text-[#2C854E] hover:underline font-bold">www.thabosystems.co.za</a></p>
              <p>Email: privacy@thabosystems.co.za / support@nutriplans.co.za</p>
              <p>Location: Johannesburg & Pretoria, South Africa</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 pb-6 text-xs text-[#6B756C] space-y-1">
          <p>NutriPlan SA • A product of Thabo Systems</p>
          <p className="text-[10px]">© 2026 Thabo Systems. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};