interface Props {
  phoneTilt: number;
  planetAltitude: number;
}

export default function TiltGauge({ phoneTilt, planetAltitude }: Props) {
  const height = 200;
  const minDeg = -10;
  const maxDeg = 90;
  const range = maxDeg - minDeg;

  const clamp = (v: number) => Math.max(0, Math.min(1, (v - minDeg) / range));
  const tiltPos = clamp(phoneTilt) * height;
  const planetPos = clamp(planetAltitude) * height;
  const aligned = Math.abs(phoneTilt - planetAltitude) <= 5;

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-display text-[8px] tracking-widest text-muted-foreground">TILT</span>
      <div className="relative" style={{ width: 24, height }}>
        {/* Track */}
        <div className="absolute inset-x-[10px] inset-y-0 rounded-full bg-muted/40" />

        {/* Planet marker */}
        <div
          className="absolute left-0 right-0 flex items-center justify-center"
          style={{ bottom: planetPos - 6, height: 12 }}
        >
          <div className="h-1.5 w-6 rounded-full bg-secondary/80" />
        </div>

        {/* Phone tilt marker */}
        <div
          className="absolute left-0 right-0 flex items-center justify-center transition-all duration-100"
          style={{ bottom: tiltPos - 8, height: 16 }}
        >
          <div
            className={`h-3 w-3 rounded-full border-2 ${
              aligned ? "border-horizon-green bg-horizon-green/40" : "border-primary bg-primary/30"
            }`}
          />
        </div>
      </div>
      <span className="font-display text-[8px] tracking-widest text-muted-foreground">
        {Math.round(phoneTilt)}°
      </span>
    </div>
  );
}
