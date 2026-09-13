import Header from "./components/Header";
import Hero from "./components/Hero";
import Belief from "./components/Belief";
import Mission from "./components/Mission";
import Values from "./components/Values";
import Experiences from "./components/Experiences";
import Menu from "./components/Menu";
import MorningTimeline from "./components/MorningTimeline";
import Saturday from "./components/Saturday";
import MoreThanMeetup from "./components/MoreThanMeetup";
import Vision from "./components/Vision";
import Audience from "./components/Audience";
import Partnerships from "./components/Partnerships";
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
        <Values />
        <Experiences />
        <Menu />
        <MorningTimeline />
        <Saturday />
        <MoreThanMeetup />
        <Vision />
        <Audience />
        <Partnerships />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
