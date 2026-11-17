import Hero from '../../components/home/Hero';
import RequestTicker from '../../components/home/RequestTicker';
import TwoSides from '../../components/home/TwoSides';
import Process from '../../components/home/Process';
import PartsIndex from '../../components/home/PartsIndex';
import Numbers from '../../components/home/Numbers';
import MakesWall from '../../components/home/MakesWall';
import VinGuide from '../../components/home/VinGuide';
import HouseRules from '../../components/home/HouseRules';
import FaqPreview from '../../components/home/FaqPreview';

export default function HomePage() {
  return (
    <>
      <Hero />
      <RequestTicker />
      <TwoSides />
      <Process />
      <PartsIndex />
      <Numbers />
      <MakesWall />
      <VinGuide />
      <HouseRules />
      <FaqPreview />
    </>
  );
}
