import React from 'react';
import { PageWrapper } from '../components/layout';

export default function SupportPage() {
  return (
    <PageWrapper
      title="Support & Help"
      subtitle="Find help, contact options, and product support resources."
    >
      <div className="grid gap-stack-lg max-w-3xl mx-auto">
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm">
          <h2 className="font-headline-md text-headline-md text-primary mb-4">Need assistance?</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            If you need support for merchant settlements, transfers, or account access,
            our support team is ready to help.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-outline-variant bg-surface p-6">
              <h3 className="font-label-md text-label-md text-primary mb-2">Live Chat</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                Chat with an advisor for urgent issues and fast resolution.
              </p>
              <a
                href="mailto:support@flashgateway.local"
                className="inline-flex items-center justify-center px-4 py-3 rounded-lg bg-secondary text-on-secondary text-label-md font-medium hover:bg-secondary-container transition-colors"
              >
                Contact Support
              </a>
            </div>
            <div className="rounded-xl border border-outline-variant bg-surface p-6">
              <h3 className="font-label-md text-label-md text-primary mb-2">Documentation</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Explore product guides, onboarding, and frequently asked questions.
              </p>
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
