import { useEffect, useMemo, useState } from 'preact/hooks';

function fireFactory(strength: number) {
  let buf: number[] = [];
  return (frameNum: number) =>
    makeFrameInner(buf, frameNum, 0.8 + (strength / 100) * 0.4);
}

function makeFrameInner(buf: number[], frameNum: number, strength: number) {
  const width = 30;

  let frameText = '';
  buf[((frameNum * frameNum) % 17) + 578] = 89; //seed the simulation
  for (let i = 90; i < 630; i++) {
    if (i % width == 0) {
      frameText += '\n';
    } else {
      let neighborhoodAvg =
        (buf[i] + buf[i + 1] + buf[i + width - 1] + buf[i + width]) / 4;
      neighborhoodAvg *= strength;
      buf[i] = ~~neighborhoodAvg;

      const intensityChars = ' -*8';
      const charIndex = Math.min(buf[i], intensityChars.length - 1);
      frameText += intensityChars[charIndex];
    }
  }
  return frameText;
}

export function Fire({ name, strength }: { name: string; strength: number }) {
  const [frame, setFrame] = useState<number>(() =>
    Math.floor(Math.random() * 1234),
  );
  const makeFrame = useMemo(() => fireFactory(strength), [strength]);

  useEffect(() => {
    const interval = setInterval(() => setFrame((frame) => frame + 1), 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div class={'fire'}>
      <pre>{makeFrame(frame)}</pre>
      <p>
        burner {name} - {strength}%
      </p>
    </div>
  );
}
