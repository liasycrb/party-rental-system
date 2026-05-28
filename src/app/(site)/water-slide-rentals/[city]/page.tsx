// Wires the shared SEO landing loader for the `water-slide-rentals` service.
import {
  landingStaticParams,
  makeLandingMetadata,
  makeLandingPage,
} from "@/lib/seo/landing-page-loader";

export const dynamic = "force-dynamic";
export const generateStaticParams = landingStaticParams;
export const generateMetadata = makeLandingMetadata("water-slide-rentals");
export default makeLandingPage("water-slide-rentals");
