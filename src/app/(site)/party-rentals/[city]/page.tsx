// Wires the shared SEO landing loader for the `party-rentals` (catch-all) service.
import {
  landingStaticParams,
  makeLandingMetadata,
  makeLandingPage,
} from "@/lib/seo/landing-page-loader";

export const dynamic = "force-dynamic";
export const generateStaticParams = landingStaticParams;
export const generateMetadata = makeLandingMetadata("party-rentals");
export default makeLandingPage("party-rentals");
