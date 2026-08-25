import Header from "./components/Header";
import Hero from "./components/Hero";
import Belief from "./components/Belief";
import Mission from "./components/Mission";
import MorningTimeline from "./components/MorningTimeline";
import Values from "./components/Values";
import Audience from "./components/Audience";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Belief />
        <Mission />
        <MorningTimeline />
        <Values />
        <Audience />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
