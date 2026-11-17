export const BRAND = {
  name: 'CarParts Finder',
  tagline: "Name the part. We'll find who has it.",
  description:
    'One request goes out to a network of verified parts suppliers. We check every quote before it reaches you, and you pick the one you want.',
  email: 'info@carpartsfinder.com',
  phone: '+971 4 000 0000',
  address: 'Dubai, United Arab Emirates',
  socials: {
    instagram: '#',
    facebook: '#',
    whatsapp: '#',
  },
};

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Find Parts', href: '/find-parts' },
  { label: 'About Us', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

/* Photography — downloaded from Unsplash into /public/assets/photos */
export const PHOTOS = {
  engineBay: '/assets/photos/engine-bay.jpg',
  oilChange: '/assets/photos/oil-change.jpg',
  garageNight: '/assets/photos/garage-night.jpg',
  toolWall: '/assets/photos/tool-wall.jpg',
  wrenchHands: '/assets/photos/wrench-hands.jpg',
  mechanic: '/assets/photos/mechanic-under-hood.jpg',
  openBonnet: '/assets/photos/open-bonnet.jpg',
  suvGarage: '/assets/photos/suv-garage.jpg',
  sedanDark: '/assets/photos/sedan-dark.jpg',
  rearRoad: '/assets/photos/rear-road.jpg',
  driverSeat: '/assets/photos/driver-seat.jpg',
  wiring: '/assets/photos/wiring.jpg',
  orangeCoupe: '/assets/photos/orange-coupe.jpg',
  fogCar: '/assets/photos/fog-car.jpg',
  silverSaloon: '/assets/photos/silver-saloon.jpg',
  tyres: '/assets/close-up-tyres.jpg',
  piston: '/assets/engine-piston-cross-section.jpg',
  worktop: '/assets/various-work-tools-worktop.jpg',
  suvRoad: '/assets/dark-blue-suv-wet-road-power-safety-modern-design.jpg',
};

export const CAR_MAKES = [
  'Toyota', 'Honda', 'Nissan', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz',
  'Audi', 'Volkswagen', 'Hyundai', 'Kia', 'Mitsubishi', 'Mazda', 'Subaru',
  'Lexus', 'Infiniti', 'Acura', 'Jeep', 'Land Rover', 'Range Rover',
  'Porsche', 'Ferrari', 'Lamborghini', 'Maserati', 'Bentley', 'Rolls-Royce',
  'Dodge', 'Ram', 'GMC', 'Cadillac', 'Lincoln', 'Volvo', 'Jaguar',
  'Peugeot', 'Renault', 'Citroën', 'Fiat', 'Alfa Romeo', 'Skoda',
  'Seat', 'Tesla', 'Genesis', 'Chrysler', 'Buick', 'MINI', 'Smart',
  'Suzuki', 'Isuzu', 'Daihatsu', 'Other',
];

export const PART_CATEGORIES = [
  'Engine & Drivetrain',
  'Brakes',
  'Suspension & Steering',
  'Body & Exterior',
  'Electrical & Lighting',
  'Transmission',
  'Cooling System',
  'Exhaust',
  'Fuel System',
  'Interior',
  'Tyres & Wheels',
  'Air Conditioning',
  'Filters & Fluids',
  'Other',
];

/* What the parts index on the home page shows for each category */
export const CATEGORY_DETAILS: Record<string, { photo: string; examples: string }> = {
  'Engine & Drivetrain': { photo: PHOTOS.engineBay, examples: 'Timing kits, gaskets, mounts, turbochargers' },
  Brakes: { photo: PHOTOS.orangeCoupe, examples: 'Pads, discs, calipers, ABS sensors' },
  'Suspension & Steering': { photo: PHOTOS.silverSaloon, examples: 'Shocks, control arms, racks, bushes' },
  'Body & Exterior': { photo: PHOTOS.suvGarage, examples: 'Bumpers, mirrors, bonnets, grilles' },
  'Electrical & Lighting': { photo: PHOTOS.wiring, examples: 'Alternators, starters, headlamps, ECUs' },
  Transmission: { photo: PHOTOS.wrenchHands, examples: 'Clutch kits, gearboxes, CV joints' },
  'Cooling System': { photo: PHOTOS.openBonnet, examples: 'Radiators, water pumps, thermostats' },
  Exhaust: { photo: PHOTOS.rearRoad, examples: 'Manifolds, catalytic converters, silencers' },
  'Fuel System': { photo: PHOTOS.piston, examples: 'Injectors, fuel pumps, throttle bodies' },
  Interior: { photo: PHOTOS.driverSeat, examples: 'Seats, dash panels, switches, trims' },
  'Tyres & Wheels': { photo: PHOTOS.tyres, examples: 'Rims, tyres, hubs, wheel bearings' },
  'Air Conditioning': { photo: PHOTOS.mechanic, examples: 'Compressors, condensers, blower motors' },
  'Filters & Fluids': { photo: PHOTOS.oilChange, examples: 'Oil, air and cabin filters, fluids' },
  Other: { photo: PHOTOS.worktop, examples: "If it bolts on, ask. We'll look." },
};

export const STATS = [
  { value: 500, suffix: '+', label: 'Verified suppliers', note: 'Trade-licensed, checked by hand' },
  { value: 10000, suffix: '+', label: 'Parts sourced', note: 'From brake pads to full engines' },
  { value: 48, prefix: '<', suffix: 'h', label: 'Typical response', note: 'Most quotes land the same day' },
  { value: 98, suffix: '%', label: 'Customer satisfaction', note: 'Measured after every order' },
];
