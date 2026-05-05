import { Categories } from "./_components/Home/Categories/Categories";
import { Features } from "./_components/Home/Features/Features";
import { Hero } from './_components/Home/Hero/Hero';
import { HowItWorks } from "./_components/Home/HowItWorks/HowItWorks";
import { Newsletter } from "./_components/Home/Newsletter/Newsletter";
import { PharmacyCTA } from "./_components/Home/PharmacyCTA/PharmacyCTA";
import { Stats } from "./_components/Home/Stats/Stats";
import { Testimonials } from "./_components/Home/Testimonials/Testimonials";


export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <Features />
      <Categories />
      <HowItWorks />
      <Testimonials />
      <PharmacyCTA />
      <Newsletter />
    </>
  );
}
