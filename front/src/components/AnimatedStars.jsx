import { useEffect, useRef } from 'react';

export default function AnimatedStars() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let mouseX = 0, mouseY = 0;
    let stars = [];
    const STAR_COUNT = 220;

    function initStars() {
      stars = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.3,
          speed: Math.random() * 0.3 + 0.05,
          opacity: Math.random(),
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinkleDir: Math.random() > 0.5 ? 1 : -1,
          depth: Math.random() * 3 + 1, // parallax depth
        });
      }
    }

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    }
    resize();
    window.addEventListener('resize', resize);

    // Shooting stars
    const shootingStars = [];
    function maybeAddShootingStar() {
      if (Math.random() < 0.003 && shootingStars.length < 2) {
        shootingStars.push({
          x: Math.random() * canvas.width * 0.7,
          y: Math.random() * canvas.height * 0.4,
          length: Math.random() * 80 + 40,
          speed: Math.random() * 8 + 6,
          opacity: 1,
        });
      }
    }

    function onMouseMove(e) {
      mouseX = (e.clientX / canvas.width - 0.5) * 2;
      mouseY = (e.clientY / canvas.height - 0.5) * 2;
    }
    window.addEventListener('mousemove', onMouseMove);

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      for (const star of stars) {
        // Twinkle
        star.opacity += star.twinkleSpeed * star.twinkleDir;
        if (star.opacity >= 1) { star.opacity = 1; star.twinkleDir = -1; }
        if (star.opacity <= 0.2) { star.opacity = 0.2; star.twinkleDir = 1; }

        // Parallax offset
        const px = mouseX * star.depth * 3;
        const py = mouseY * star.depth * 3;

        // Slow drift
        star.y -= star.speed;
        if (star.y < -5) { star.y = canvas.height + 5; star.x = Math.random() * canvas.width; }

        const drawX = star.x + px;
        const drawY = star.y + py;

        ctx.beginPath();
        ctx.arc(drawX, drawY, star.size, 0, Math.PI * 2);
        const brightness = Math.floor(180 + star.opacity * 75);
        ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${Math.min(255, brightness + 40)}, ${star.opacity})`;
        ctx.fill();

        // Glow on larger stars
        if (star.size > 1.2) {
          ctx.beginPath();
          ctx.arc(drawX, drawY, star.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(124, 58, 237, ${star.opacity * 0.06})`;
          ctx.fill();
        }
      }

      // Draw shooting stars
      maybeAddShootingStar();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += ss.speed;
        ss.y += ss.speed * 0.6;
        ss.opacity -= 0.015;

        if (ss.opacity <= 0) { shootingStars.splice(i, 1); continue; }

        const gradient = ctx.createLinearGradient(
          ss.x, ss.y,
          ss.x - ss.length, ss.y - ss.length * 0.6
        );
        gradient.addColorStop(0, `rgba(167, 139, 250, ${ss.opacity})`);
        gradient.addColorStop(1, 'rgba(167, 139, 250, 0)');

        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.length, ss.y - ss.length * 0.6);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
