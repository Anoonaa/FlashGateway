/**
 * LANDING PAGE
 * Public landing page with hero, features, CTA sections
 */

import React from "react";
import { Link } from "react-router-dom";
import { Header, Footer } from "../components/layout";
import { useToast } from "../hooks";
import dashboardPreview from "../../assets/dashboard-preview.png";

export default function LandingPage() {
  const { notify } = useToast();

  return (
    <div className="bg-background text-on-surface">
      <Header />

      <main className="pt-16 sm:pt-20">
        <section className="relative overflow-hidden bg-surface py-24 md:py-32">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="z-10">
              <span className="inline-block py-1 px-3 mb-6 bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm rounded-full">
                MERCHANT SETTLEMENT
              </span>
              <h1 className="font-display-lg text-display-lg text-primary mb-6 leading-[1.1]">
                Merchant settlement and purchase issuance, reimagined.
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-xl">
                Seamless merchant settlements and purchase workflows for modern
                businesses. Experience a payments platform built for high-
                volume commerce.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  className="bg-secondary text-on-secondary px-10 py-4 rounded font-label-md text-label-md hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
                  to="/login"
                  style={{ textDecoration: "none" }}
                >
                  Sign In as Merchant
                  <span className="material-symbols-outlined text-[20px]">
                    arrow_forward
                  </span>
                </Link>
                <button
                  type="button"
                  className="border border-outline-variant text-on-surface px-10 py-4 rounded font-label-md text-label-md hover:bg-surface-container-low transition-all flex items-center justify-center gap-2"
                  onClick={() => notify('Demo playback is coming soon.', 'info')}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    play_circle
                  </span>
                  Watch Demo
                </button>
              </div>
              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-3">
                  <img
                    className="w-10 h-10 rounded-full border-2 border-surface"
                    alt="Professional financial executive"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop"
                  />
                  <img
                    className="w-10 h-10 rounded-full border-2 border-surface"
                    alt="Professional female executive"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop"
                  />
                  <img
                    className="w-10 h-10 rounded-full border-2 border-surface"
                    alt="Professional male executive"
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop"
                  />
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Trusted by 5,000+ High-Net-Worth Individuals
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-secondary/5 blur-[120px] rounded-full"></div>
              <div className="relative z-10 p-8 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-2xl overflow-hidden aspect-[4/3] flex items-center justify-center">
                <img
                  className="w-full h-full object-contain rounded shadow-sm"
                  alt="FlashGateway Dashboard Interface"
                  src={dashboardPreview}
                />
              </div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-secondary/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-surface-container-lowest">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-10">
            <div className="text-center mb-20">
              <h2 className="font-headline-lg text-headline-lg text-primary mb-4">
                Master Your Merchant Settlements
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
                An integrated suite of commerce tools designed to provide total
                visibility and control over your settlement and purchase workflows.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 group relative overflow-hidden p-8 rounded-xl bg-surface border border-outline-variant hover:border-secondary transition-all">
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <span className="material-symbols-outlined text-secondary text-[40px] mb-6">
                      devices
                    </span>
                    <h3 className="font-headline-md text-headline-md text-primary mb-3">
                      Multi-Platform Fluidity
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                      Access your account through our desktop portal or the
                      native mobile application, featuring biometric security
                      and real-time syncing.
                    </p>
                  </div>
                  <div className="mt-8 transform group-hover:translate-y-[-4px] transition-transform">
                    <img
                      className="w-full h-48 object-contain rounded-lg bg-surface-container-lowest border border-outline-variant/20 p-3"
                      alt="Multi-Platform Device Synchronization"
                      src={dashboardPreview}
                    />
                  </div>
                </div>
              </div>
              <div className="group relative overflow-hidden p-8 rounded-xl bg-tertiary-container text-on-tertiary border border-outline-variant/10">
                <div className="flex flex-col h-full">
                  <span className="material-symbols-outlined text-secondary-fixed text-[40px] mb-6">
                    query_stats
                  </span>
                  <h3 className="font-headline-md text-headline-md mb-3">
                    Usage Analytics
                  </h3>
                  <p className="font-body-md text-body-md text-on-tertiary-container mb-12">
                    Visualise growth with enterprise-grade reporting and custom
                    ledger views.
                  </p>
                  <div className="mt-auto">
                    <div className="bg-surface/10 p-4 rounded border border-surface/20">
                      <div className="flex justify-between items-end mb-2">
                        <div className="w-2 h-12 bg-secondary-fixed opacity-40 rounded-t"></div>
                        <div className="w-2 h-16 bg-secondary-fixed opacity-60 rounded-t"></div>
                        <div className="w-2 h-24 bg-secondary-fixed rounded-t"></div>
                        <div className="w-2 h-14 bg-secondary-fixed opacity-50 rounded-t"></div>
                        <div className="w-2 h-20 bg-secondary-fixed opacity-80 rounded-t"></div>
                      </div>
                      <div className="h-[1px] bg-surface/20 w-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-surface">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-primary mb-6">
                  Core Connectivity Features
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mb-8">
                  Precision engineering for every action, from local recharges
                  to fund movement.
                </p>
                <Link
                  className="text-secondary font-label-md text-label-md flex items-center gap-2 hover:gap-3 transition-all"
                  to="/dashboard"
                  style={{ textDecoration: "none" }}
                >
                  Explore All Features{" "}
                  <span className="material-symbols-outlined">
                    arrow_right_alt
                  </span>
                </Link>
              </div>
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-surface-container-lowest border border-outline-variant/30 rounded-xl hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-secondary/10 flex items-center justify-center rounded-lg mb-6">
                    <span className="material-symbols-outlined text-secondary">
                      payments
                    </span>
                  </div>
                  <h4 className="font-headline-md text-[20px] text-primary mb-3">
                    Instant Transfers
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Secure money movement across local and international
                    beneficiaries with sub-second execution.
                  </p>
                </div>
                <div className="p-8 bg-surface-container-lowest border border-outline-variant/30 rounded-xl hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-secondary/10 flex items-center justify-center rounded-lg mb-6">
                    <span className="material-symbols-outlined text-secondary">
                      wifi_tethering
                    </span>
                  </div>
                  <h4 className="font-headline-md text-[20px] text-primary mb-3">
                    Airtime &amp; Data
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Instant recharges for all major SA networks including
                    Vodacom, MTN, and Telkom directly from your vault.
                  </p>
                </div>
                <div className="p-8 bg-surface-container-lowest border border-outline-variant/30 rounded-xl hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-secondary/10 flex items-center justify-center rounded-lg mb-6">
                    <span className="material-symbols-outlined text-secondary">
                      receipt_long
                    </span>
                  </div>
                  <h4 className="font-headline-md text-[20px] text-primary mb-3">
                    Enterprise Reporting
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Advanced ledger tracking and transaction history with
                    PDF/CSV exports for tax and audit compliance.
                  </p>
                </div>
                <div className="p-8 bg-surface-container-lowest border border-outline-variant/30 rounded-xl hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-secondary/10 flex items-center justify-center rounded-lg mb-6">
                    <span className="material-symbols-outlined text-secondary">
                      group_work
                    </span>
                  </div>
                  <h4 className="font-headline-md text-[20px] text-primary mb-3">
                    Multi-User Access
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Delegate authority to family members or corporate advisors
                    with granular permission controls.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-tertiary-container text-on-tertiary">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-10">
            <div className="flex flex-col md:flex-row gap-16 items-center">
              <div className="flex-1">
                <img
                  className="w-full rounded-2xl shadow-2xl"
                  alt="Premium financial security interface"
                  src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"
                />
              </div>
              <div className="flex-1">
                <span className="inline-block py-1 px-3 mb-6 bg-secondary text-on-secondary font-label-sm text-label-sm rounded-full">
                  SECURITY FIRST
                </span>
                <h2 className="font-headline-lg text-headline-lg mb-6">
                  Bank-Grade Security for Peace of Mind.
                </h2>
                <p className="font-body-lg text-body-lg text-on-tertiary-container mb-8">
                  We employ 256-bit AES encryption, multi-factor authentication,
                  and biometrics to ensure your assets remain yours alone. Fully
                  regulated and compliant with South African financial
                  standards.
                </p>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <span className="material-symbols-outlined text-secondary-fixed">
                      verified_user
                    </span>
                    <div>
                      <h5 className="font-label-md text-label-md mb-1">
                        Regulatory Compliance
                      </h5>
                      <p className="font-body-sm text-body-sm text-on-tertiary-container">
                        Registered FSP ensuring all transactions follow strictly
                        monitored banking protocols.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <span className="material-symbols-outlined text-secondary-fixed">
                      encrypted
                    </span>
                    <div>
                      <h5 className="font-label-md text-label-md mb-1">
                        End-to-End Encryption
                      </h5>
                      <p className="font-body-sm text-body-sm text-on-tertiary-container">
                        Your data is masked and encrypted from the moment it
                        leaves your device.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-surface text-center">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-10">
            <div className="bg-surface-container-high py-20 px-8 rounded-3xl border border-outline-variant/30">
              <h2 className="font-display-lg text-display-lg text-primary mb-6">
                Experience the Future of Merchant Settlement.
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-2xl mx-auto">
                Join the exclusive ranks of FlashGateway merchants and take control
                of your settlement workflow today.
              </p>
              <Link
                className="bg-primary text-on-primary px-12 py-4 rounded font-label-md text-label-md hover:scale-[1.05] transition-all shadow-xl inline-block"
                to="/login"
                style={{ textDecoration: "none" }}
              >
                Sign In as Merchant
              </Link>
              <p className="mt-6 font-label-sm text-label-sm text-on-surface-variant">
                No monthly fees for the first 6 months. Subject to status.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
