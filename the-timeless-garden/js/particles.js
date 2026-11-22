// Hệ thống hạt ánh sáng, cánh hoa bay và sao tương tác trên Canvas 2D
class GardenParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
    this.bursts = [];
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.mode = "dust"; // 'dust' ở màn mở đầu | 'garden' ở khu vườn
    this.resize();
    this.seedParticles();

    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  setMode(newMode) {
    this.mode = newMode;
    this.seedParticles();
  }

  setReducedMotion(flag) {
    this.reducedMotion = flag;
  }

  seedParticles() {
    const count = Math.min(75, Math.floor((this.width * this.height) / 18000));
    this.particles = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      r: Math.random() * 2.6 + 1,
      vx: (Math.random() - 0.5) * 0.45,
      vy: this.mode === "garden" ? Math.random() * 0.45 + 0.15 : -(Math.random() * 0.35 + 0.1),
      alpha: Math.random() * 0.65 + 0.25,
      phase: Math.random() * Math.PI * 2,
      kind: this.mode === "garden" && i % 3 === 0 ? "petal" : "firefly",
      rot: Math.random() * Math.PI * 2
    }));
  }

  spawnStarBurst(x, y, amount = 14) {
    if (this.reducedMotion) return;
    for (let i = 0; i < amount; i++) {
      const angle = (Math.PI * 2 * i) / amount + Math.random() * 0.4;
      const speed = Math.random() * 2.5 + 0.8;
      this.bursts.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        life: 1,
        size: Math.random() * 3 + 1.5
      });
    }
  }

  drawStar(x, y, r, alpha) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = `rgba(216, 181, 109, ${alpha})`;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.lineTo(0, -r * 2.2);
      ctx.lineTo(r * 0.5, -r * 0.5);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    for (const p of this.particles) {
      if (!this.reducedMotion) {
        p.phase += 0.02;
        p.x += p.vx + Math.sin(p.phase) * 0.25;
        p.y += p.vy;
        p.rot += 0.012;

        if (p.y > this.height + 20) p.y = -15;
        if (p.y < -20) p.y = this.height + 15;
        if (p.x > this.width + 20) p.x = -15;
        if (p.x < -20) p.x = this.width + 15;
      }

      const glowAlpha = p.alpha * (0.7 + 0.3 * Math.sin(p.phase));
      if (p.kind === "petal") {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = `rgba(201, 142, 145, ${glowAlpha * 0.85})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r * 2.6, p.r * 1.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(216, 181, 109, ${glowAlpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#D8B56D";
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Các ngôi sao xuất hiện khi tương tác
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i];
      b.x += b.vx;
      b.y += b.vy;
      b.life -= 0.022;
      if (b.life <= 0) {
        this.bursts.splice(i, 1);
        continue;
      }
      this.drawStar(b.x, b.y, b.size, b.life);
    }

    requestAnimationFrame(() => this.render());
  }
}

window.GardenParticleSystem = GardenParticleSystem;
