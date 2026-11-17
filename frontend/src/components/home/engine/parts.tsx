/*
 * Inline-4 engine, side elevation with a cutaway through the bores.
 * Every part is drawn at its assembled position; `dx`/`dy` is where it
 * travels at full explode. Drawn in painter's order (back → front).
 *
 * Classes: .fl = filled solid, .ln = outline only, .dim = secondary detail,
 *          .bore = cutaway cavity
 */

export interface EnginePart {
  id: string;
  no: string;
  name: string;
  /** what goes in the request form */
  requestName: string;
  category: string;
  dx: number;
  dy: number;
  /** leader line: from anchor to balloon */
  anchor: [number, number];
  balloon: [number, number];
  draw: () => React.ReactNode;
}

const BORES = [242, 326, 410, 494];
const CENTERS = BORES.map((x) => x + 32);

const timing: EnginePart = {
  id: 'timing',
  no: '10',
  name: 'Timing belt kit',
  requestName: 'Timing belt kit',
  category: 'Engine & Drivetrain',
  dx: -150,
  dy: 0,
  anchor: [166, 300],
  balloon: [140, 270],
  draw: () => (
    <>
      <path
        className="ln"
        strokeWidth={4}
        d="M178,221 L163,330 L174,432 A22,22 0 0 0 218,432 L230,221 A26,26 0 0 0 178,221 Z"
      />
      <circle className="fl" cx={204} cy={221} r={26} />
      <circle className="ln dim" cx={204} cy={221} r={21} strokeDasharray="3 3" />
      <circle className="fl" cx={204} cy={221} r={6} />
      <line className="ln" x1={204} y1={195} x2={204} y2={203} />
      <circle className="fl" cx={196} cy={432} r={22} />
      <circle className="ln dim" cx={196} cy={432} r={17} strokeDasharray="3 3" />
      <circle className="fl" cx={196} cy={432} r={6} />
      <circle className="fl" cx={172} cy={330} r={9} />
      <circle className="ln dim" cx={172} cy={330} r={3} />
    </>
  ),
};

const flywheel: EnginePart = {
  id: 'flywheel',
  no: '11',
  name: 'Flywheel',
  requestName: 'Flywheel',
  category: 'Transmission',
  dx: 130,
  dy: 0,
  anchor: [606, 372],
  balloon: [640, 340],
  draw: () => (
    <>
      <rect className="fl" x={592} y={368} width={14} height={128} />
      {Array.from({ length: 16 }, (_, i) => (
        <line key={i} className="ln dim" x1={606} y1={374 + i * 7.6} x2={611} y2={374 + i * 7.6} />
      ))}
      <rect className="fl" x={586} y={420} width={6} height={24} />
    </>
  ),
};

const alternator: EnginePart = {
  id: 'alternator',
  no: '12',
  name: 'Alternator',
  requestName: 'Alternator',
  category: 'Electrical & Lighting',
  dx: 80,
  dy: -70,
  anchor: [668, 290],
  balloon: [700, 262],
  draw: () => (
    <>
      <line className="ln dim" x1={580} y1={300} x2={610} y2={300} />
      <rect className="fl" x={604} y={294} width={10} height={12} />
      <circle className="fl" cx={640} cy={300} r={30} />
      {[-12, -4, 4, 12].map((o) => (
        <line key={o} className="ln dim" x1={622} y1={300 + o} x2={658} y2={300 + o} />
      ))}
      <circle className="fl" cx={640} cy={300} r={11} />
      <circle className="ln dim" cx={640} cy={300} r={4} />
    </>
  ),
};

const sump: EnginePart = {
  id: 'sump',
  no: '09',
  name: 'Oil sump',
  requestName: 'Oil sump (pan)',
  category: 'Engine & Drivetrain',
  dx: 0,
  dy: 120,
  anchor: [566, 480],
  balloon: [612, 498],
  draw: () => (
    <>
      <path className="fl" d="M226,452 H574 L566,480 H470 L456,522 H304 L290,480 H234 Z" />
      <line className="ln dim" x1={300} y1={490} x2={460} y2={490} />
      <line className="ln dim" x1={240} y1={462} x2={560} y2={462} />
      <rect className="fl" x={374} y={522} width={12} height={6} />
    </>
  ),
};

const block: EnginePart = {
  id: 'block',
  no: '07',
  name: 'Engine block',
  requestName: 'Engine block',
  category: 'Engine & Drivetrain',
  dx: 0,
  dy: 0,
  anchor: [220, 372],
  balloon: [176, 384],
  draw: () => (
    <>
      <path className="fl" d="M220,300 H580 V410 L570,450 H230 L220,410 Z" />
      <line className="ln dim" x1={220} y1={410} x2={580} y2={410} />
      {BORES.map((x) => (
        <rect key={x} className="bore" x={x} y={300} width={64} height={104} />
      ))}
      {[316, 400, 484].map((x) => (
        <circle key={x} className="ln dim" cx={x} cy={330} r={3} />
      ))}
      {[234, 318, 402, 486, 566].map((x) => (
        <rect key={x} className="ln dim" x={x - 7} y={414} width={14} height={30} />
      ))}
    </>
  ),
};

const crank: EnginePart = {
  id: 'crank',
  no: '08',
  name: 'Crankshaft',
  requestName: 'Crankshaft',
  category: 'Engine & Drivetrain',
  dx: 0,
  dy: 68,
  anchor: [596, 432],
  balloon: [640, 452],
  draw: () => (
    <>
      <rect className="fl" x={200} y={428} width={388} height={8} />
      <rect className="fl" x={188} y={429} width={12} height={6} />
      <rect className="fl" x={588} y={418} width={8} height={28} />
      {CENTERS.map((cx) => (
        <g key={cx}>
          <path className="fl" d={`M${cx - 24},436 A26,26 0 0 0 ${cx + 24},436 Z`} />
          <rect className="fl" x={cx - 16} y={414} width={32} height={22} />
          <circle className="ln" cx={cx} cy={422} r={6} />
        </g>
      ))}
    </>
  ),
};

const pistons: EnginePart = {
  id: 'pistons',
  no: '06',
  name: 'Pistons & con-rods',
  requestName: 'Piston & connecting rod',
  category: 'Engine & Drivetrain',
  dx: 0,
  dy: -28,
  anchor: [554, 316],
  balloon: [614, 300],
  draw: () => (
    <>
      {BORES.map((x0, i) => {
        const cx = CENTERS[i];
        return (
          <g key={x0}>
            <path className="fl" d={`M${cx - 5},336 L${cx - 8},414 L${cx + 8},414 L${cx + 5},336 Z`} />
            <circle className="fl" cx={cx} cy={422} r={11} />
            <circle className="ln dim" cx={cx} cy={422} r={4} />
            <rect className="fl" x={x0 + 4} y={304} width={56} height={42} />
            {[310, 315, 320].map((y) => (
              <line key={y} className="ln dim" x1={x0 + 4} y1={y} x2={x0 + 60} y2={y} />
            ))}
            <circle className="ln" cx={cx} cy={332} r={5} />
          </g>
        );
      })}
    </>
  ),
};

const gasket: EnginePart = {
  id: 'gasket',
  no: '05',
  name: 'Head gasket',
  requestName: 'Head gasket',
  category: 'Engine & Drivetrain',
  dx: 0,
  dy: -52,
  anchor: [222, 296],
  balloon: [176, 296],
  draw: () => (
    <>
      <rect className="fl" x={222} y={293} width={356} height={6} />
      {BORES.map((x) => (
        <line key={x} className="ln dim" x1={x + 4} y1={296} x2={x + 60} y2={296} strokeDasharray="2 3" />
      ))}
    </>
  ),
};

const head: EnginePart = {
  id: 'head',
  no: '04',
  name: 'Cylinder head',
  requestName: 'Cylinder head',
  category: 'Engine & Drivetrain',
  dx: 0,
  dy: -82,
  anchor: [574, 252],
  balloon: [618, 236],
  draw: () => (
    <>
      <path className="fl" d="M226,230 H574 V292 H226 Z" />
      {CENTERS.map((cx) => (
        <g key={cx}>
          {[cx - 14, cx + 14].map((vx) => (
            <g key={vx}>
              <line className="ln" x1={vx} y1={236} x2={vx} y2={282} />
              <line className="ln" x1={vx - 8} y1={284} x2={vx + 8} y2={284} />
              <polyline
                className="ln dim"
                points={`${vx - 5},240 ${vx + 5},244 ${vx - 5},248 ${vx + 5},252 ${vx - 5},256 ${vx + 5},260`}
              />
            </g>
          ))}
          <path className="ln dim" d={`M${cx - 30},292 Q${cx},274 ${cx + 30},292`} />
        </g>
      ))}
    </>
  ),
};

const cams: EnginePart = {
  id: 'cams',
  no: '03',
  name: 'Camshaft',
  requestName: 'Camshaft',
  category: 'Engine & Drivetrain',
  dx: 0,
  dy: -118,
  anchor: [236, 221],
  balloon: [190, 214],
  draw: () => (
    <>
      <rect className="fl" x={226} y={218} width={346} height={6} />
      {CENTERS.flatMap((cx) => [cx - 14, cx + 14]).map((vx) => (
        <ellipse key={vx} className="fl" cx={vx} cy={221} rx={6} ry={9} />
      ))}
    </>
  ),
};

const cover: EnginePart = {
  id: 'cover',
  no: '02',
  name: 'Valve cover',
  requestName: 'Valve cover',
  category: 'Engine & Drivetrain',
  dx: 0,
  dy: -160,
  anchor: [242, 186],
  balloon: [196, 170],
  draw: () => (
    <>
      <path className="fl" d="M232,212 L568,212 L560,176 Q557,166 546,166 L254,166 Q243,166 240,176 Z" />
      <line className="ln dim" x1={246} y1={194} x2={554} y2={194} />
      <rect className="fl" x={470} y={154} width={34} height={12} />
      <text x={300} y={206} className="engine-txt">
        DOHC 16V
      </text>
    </>
  ),
};

const coils: EnginePart = {
  id: 'coils',
  no: '01',
  name: 'Ignition coils',
  requestName: 'Ignition coil',
  category: 'Electrical & Lighting',
  dx: 0,
  dy: -210,
  anchor: [537, 128],
  balloon: [584, 108],
  draw: () => (
    <>
      {CENTERS.map((cx) => (
        <g key={cx}>
          <rect className="fl" x={cx - 5} y={160} width={10} height={14} />
          <rect className="fl" x={cx - 11} y={122} width={22} height={38} />
          <rect className="fl" x={cx - 8} y={112} width={16} height={10} />
          <line className="ln dim" x1={cx - 11} y1={134} x2={cx + 11} y2={134} />
          <line className="ln dim" x1={cx - 11} y1={144} x2={cx + 11} y2={144} />
        </g>
      ))}
    </>
  ),
};

/* painter's order */
export const ENGINE_PARTS: EnginePart[] = [
  timing,
  flywheel,
  alternator,
  sump,
  block,
  crank,
  pistons,
  gasket,
  head,
  cams,
  cover,
  coils,
];

/* legend order (by balloon number) */
export const ENGINE_LEGEND = [...ENGINE_PARTS].sort((a, b) => a.no.localeCompare(b.no));
