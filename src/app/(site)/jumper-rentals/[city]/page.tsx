// Wires the shared SEO landing loader for the `jumper-rentals` service.
// All logic lives in `landing-page-loader`; this file only declares the route.
import {
  landingStaticParams,
  makeLandingMetadata,
  makeLandingPage,
} from "@/lib/seo/landing-page-loader";

export const dynamic = "force-dynamic";
export const generateStaticParams = landingStaticParams;
export const generateMetadata = makeLandingMetadata("jumper-rentals");
export default makeLandingPage("jumper-rentals");
