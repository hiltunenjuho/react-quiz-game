export type BrandEdge = {
  axis: 'horizontal' | 'vertical';
  x: number;
  y: number;
  length: number;
};

const text = 'knowdium!';
const size = 200;
const padding = 4;
const canvasBaseline = 220;

export function createBrandEdges(): BrandEdge[] {
  const probe = document.createElement('span');
  probe.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;font:${size}px/1 Honk,system-ui,sans-serif;font-variation-settings:"MORF" 15,"SHLN" 50`;
  const baseline = document.createElement('span');
  baseline.style.cssText = 'display:inline-block;width:0;height:0';
  probe.append(text, baseline);
  document.body.append(probe);
  const textBaseline = baseline.getBoundingClientRect().top - probe.getBoundingClientRect().top;
  probe.remove();

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Unable to create the Knowdium hero outline');

  context.font = `${size}px Honk, system-ui, sans-serif`;
  const width = Math.ceil(context.measureText(text).width) + padding * 2;
  canvas.width = width;
  canvas.height = size * 2;
  context.font = `${size}px Honk, system-ui, sans-serif`;
  context.fillText(text, padding, canvasBaseline);
  const pixels = context.getImageData(0, 0, width, canvas.height).data;
  const filled = (x: number, y: number) => (
    x >= 0 && x < width && y >= 0 && y < canvas.height
    && pixels[(y * width + x) * 4 + 3] > 32
  );
  const edges: BrandEdge[] = [];

  for (let y = 0; y < canvas.height; y++) {
    for (const direction of [-1, 1]) {
      let start = -1;
      for (let x = 0; x <= width; x++) {
        const boundary = filled(x, y) && !filled(x, y + direction);
        if (boundary && start < 0) start = x;
        if (!boundary && start >= 0) {
          edges.push({
            axis: 'horizontal',
            x: (start - padding - 1) / size,
            y: (y + (direction === 1 ? 1 : 0) - canvasBaseline + textBaseline) / size,
            length: (x - start + 2) / size,
          });
          start = -1;
        }
      }
    }
  }

  for (let x = 0; x < width; x++) {
    for (const direction of [-1, 1]) {
      let start = -1;
      for (let y = 0; y <= canvas.height; y++) {
        const boundary = filled(x, y) && !filled(x + direction, y);
        if (boundary && start < 0) start = y;
        if (!boundary && start >= 0) {
          edges.push({
            axis: 'vertical',
            x: (x + (direction === 1 ? 1 : 0) - padding) / size,
            y: (start - 1 - canvasBaseline + textBaseline) / size,
            length: (y - start + 2) / size,
          });
          start = -1;
        }
      }
    }
  }

  if (!edges.length) throw new Error('The Knowdium hero outline is empty');
  return edges;
}
