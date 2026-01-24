import { Metadata } from 'next';
import JobsClient from './JobsClient';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: "Jobs in Nepal - Finding Your Next Opportunity",
    description: "Browse the latest job vacancies in Nepal. From IT and engineering to marketing and freelancing - find your dream career at Rojgaar Nepal.",
    keywords: ["job in nepal", "vacancy nepal", "online jobs nepal", "work in kathmandu"],
};

export default function JobsPage() {
    return (
        <Suspense fallback={<div className="text-center py-20 font-bold opacity-50">Loading Opportunities...</div>}>
            <JobsClient />
        </Suspense>
    );
}
