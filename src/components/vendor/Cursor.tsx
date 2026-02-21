import { useEffect } from "react";

const Cursor = () => {
  useEffect(() => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const grid_size = 16;
    const font_size = 16;
    const particle_duration = 800;
    const explosion_count = 50;
    const trail_width = 300;
    const trail_delay = 100;

    const size = () => {
      let width = window.innerWidth;
      let height = window.innerHeight;

      canvas.width = width * 2;
      canvas.height = height * 2;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.getContext('2d')?.scale(2, 2);

      context.textBaseline = "middle";
      context.textAlign = "center";
    };

    size();

    const resizeHandler = () => {
      size();
    };
    window.addEventListener("resize", resizeHandler);

    const trailGlyph = "･✻◦✷✧○❋";

    let trail: any[] = [];
    let glyphCanvases: HTMLCanvasElement[] = [];

    // Updated to check for scheme-dark class instead of dark
    const checkDarkMode = () => {
      return document.documentElement.classList.contains('scheme-dark');
    };

    const renderSeed = (isDark: boolean) => {
      glyphCanvases = [];

      const glyphs = [...trailGlyph];
      const color = isDark ? "white" : "black";

      glyphs.forEach((glyph) => {
        const newCanvas = document.createElement('canvas');
        newCanvas.width = font_size * 2;
        newCanvas.height = font_size * 2;
        newCanvas.style.width = `${font_size}px`;
        newCanvas.style.height = `${font_size}px`;
        const newContext = newCanvas.getContext('2d');
        if (!newContext) return;
        newContext.scale(2, 2);
        newContext.fillStyle = color;
        newContext.font = `${font_size}px Monaco`;
        newContext.textAlign = 'center';
        newContext.textBaseline = 'middle';
        newContext.fillText(glyph, font_size / 2, font_size / 2);
        glyphCanvases.push(newCanvas);
      });
    };

    renderSeed(checkDarkMode());

    // Watch for theme changes on both class attributes
    const observer = new MutationObserver(() => {
      renderSeed(checkDarkMode());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });

    const toGrid = (x: number, y: number) => {
      return [
        Math.round(x / grid_size) * grid_size,
        Math.round(y / grid_size) * grid_size,
      ];
    };

    const mousedownHandler = (e: MouseEvent) => {
      const [originX, originY] = [e.clientX, e.clientY];

      for (let i = 0; i < explosion_count; i++) {
        const randomX = Math.floor((Math.random() * trail_width) - trail_width / 2);
        const randomY = Math.floor((Math.random() * trail_width) - trail_width / 2);
        trail.unshift({
          originX,
          originY,
          deltaX: randomX,
          deltaY: randomY,
          start: performance.now(),
          char: Math.floor(Math.random() * glyphCanvases.length),
        });
      }
    };

    const mousemoveHandler = (e: MouseEvent) => {
      const [originX, originY] = [e.clientX, e.clientY];

      const lastCursor = trail[0] || {
        originX,
        originY,
      };

      const [movementX, movementY] = toGrid(originX - lastCursor.originX, originY - lastCursor.originY);
      if (trail[0] && movementX === 0 && movementY === 0) return;

      for (let i = 0; i < 1; i++) {
        const randomX = Math.floor((Math.random() * trail_width) - trail_width / 2);
        const randomY = Math.floor((Math.random() * trail_width) - trail_width / 2);

        trail.unshift({
          originX,
          originY,
          deltaX: randomX,
          deltaY: randomY,
          start: performance.now(),
          char: Math.floor(Math.random() * trailGlyph.length),
        });
      }
    };

    window.addEventListener("mousedown", mousedownHandler);
    window.addEventListener("mousemove", mousemoveHandler);

    const render = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      trail.forEach((item) => {
        const life = performance.now() - item.start;

        if (life < trail_delay) return;

        const adjustedLifespan = life - trail_delay;

        if (adjustedLifespan > particle_duration) {
          trail.pop();
          return;
        }

        const lifeRatio = adjustedLifespan / particle_duration;
        const textSize = font_size - lifeRatio * font_size;
        const [spreadX, spreadY] = [
          item.deltaX * lifeRatio,
          item.deltaY * lifeRatio,
        ];
        const [resultX, resultY] = toGrid(item.originX + spreadX, item.originY + spreadY);
        let adjustedX = resultX - (textSize / 2);
        let adjustedY = resultY - (textSize / 2);

        const char = item.char;
        if (glyphCanvases[char]) {
          context.drawImage(
            glyphCanvases[char],
            adjustedX,
            adjustedY,
            Math.round(textSize),
            Math.round(textSize)
          );
        }
      });

      requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeHandler);
      window.removeEventListener("mousedown", mousedownHandler);
      window.removeEventListener("mousemove", mousemoveHandler);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      id="canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
};

export default Cursor;