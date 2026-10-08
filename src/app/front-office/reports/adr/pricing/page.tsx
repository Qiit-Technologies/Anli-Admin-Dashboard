import { redirect } from 'next/navigation';

/** Legacy URL: ADR hub now uses tabs on the main ADR page. */
export default function AdrPricingLegacyRedirect() {
    redirect('/front-office/reports/adr?tab=whatif');
}
