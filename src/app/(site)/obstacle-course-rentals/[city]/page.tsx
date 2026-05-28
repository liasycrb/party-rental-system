// Wires the shared SEO landing loader for the `obstacle-course-rentals` service.
import {
  landingStaticParams,
  makeLandingMetadata,
  makeLandingPage,
} from "@/lib/seo/landing-page-loader";

export const dynamic = "force-dynamic";
export const generateStaticParams = landingStaticParams;
export const generateMetadata = makeLandingMetadata("obstacle-course-rentals");
export default makeLandingPage("obstacle-course-rentals");
