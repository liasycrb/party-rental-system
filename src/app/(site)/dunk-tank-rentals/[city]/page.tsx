// Wires the shared SEO landing loader for the `dunk-tank-rentals` service.
// No inventory matches today → the template renders the honest empty-inventory
// fallback CTA (call) instead of fake products.
import {
  landingStaticParams,
  makeLandingMetadata,
  makeLandingPage,
} from "@/lib/seo/landing-page-loader";

export const dynamic = "force-dynamic";
export const generateStaticParams = landingStaticParams;
export const generateMetadata = makeLandingMetadata("dunk-tank-rentals");
export default makeLandingPage("dunk-tank-rentals");
