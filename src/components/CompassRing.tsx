interface Props {
  phoneAzimuth: number;
  planetAzimuth: number;
}

export default function CompassRing({ phoneAzimuth, planetAzimuth }: Props) {
  const size = 120;
  const r = 48;
  const center = size / 2;

  // Planet direction relative to phone
  const planetAngle = ((planetAzimuth - phoneAzimuth + 360) % 360) * (Math.PI / 180);
  const arrowX = center + Math.sin(planetAngle) * (r - 8);
  const arrowY = center - Math.cos(planetAngle) * (r - 8);

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: `rotate(${-phoneAzimuth}deg)` }}
        className="transition-transform duration-100"
      >
        {/* Outer ring */}
        <circle cx={center} cy={center} r={r} fill="none" stroke="hsla(199,91%,64%,0.3)" strokeWidth="2" />
        <circle cx={center} cy={center} r={r - 1} fill="none" stroke="hsla(199,91%,64%,0.1)" strokeWidth="6" />

        {/* Cardinal directions */}
        {[
          { label: "N", angle: 0, color: "hsl(0,70%,55%)" },
          { label: "E", angle: 90, color: "hsl(199,91%,64%)" },
          { label: "S", angle: 180, color: "hsl(199,91%,64%)" },
          { label: "W", angle: 270, color: "hsl(199,91%,64%)" },
        ].map(({ label, angle, color }) => {
          const rad = (angle * Math.PI) / 180;
          const tx = center + Math.sin(rad) * (r + 10);
          const ty = center - Math.cos(rad) * (r + 10);
          return (
            <text
              key={label}
              x={tx}
              y={ty}
              fill={color}
              fontSize="10"
              fontFamily="Orbitron"
              fontWeight="700"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {label}
            </text>
          );
        })}

        {/* Tick marks every 30° */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x1 = center + Math.sin(angle) * (r - 6);
          const y1 = center - Math.cos(angle) * (r - 6);
          const x2 = center + Math.sin(angle) * r;
          const y2 = center - Math.cos(angle) * r;
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsla(199,91%,64%,0.4)" strokeWidth="1.5" />
          );
        })}

        {/* Planet arrow */}
        <circle cx={arrowX} cy={arrowY} r={5} fill="hsl(45,100%,66%)" />
        <circle cx={arrowX} cy={arrowY} r={8} fill="none" stroke="hsla(45,100%,66%,0.4)" strokeWidth="1.5" />

        {/* Center dot */}
        <circle cx={center} cy={center} r={3} fill="hsl(199,91%,64%)" />
      </svg>
      <span className="mt-1 font-display text-[9px] tracking-widest text-muted-foreground">
        {Math.round(phoneAzimuth)}°
      </span>
    </div>
  );
}
