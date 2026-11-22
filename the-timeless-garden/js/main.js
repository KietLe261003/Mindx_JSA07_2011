document.addEventListener("DOMContentLoaded", () => {
  // 1. Khởi tạo hệ thống hạt Canvas
  const canvas = document.getElementById("garden-canvas");
  const particleSystem = new window.GardenParticleSystem(canvas);
  particleSystem.render();
  window.particleSystem = particleSystem;

  // 2. Điều khiển Âm thanh & Chuyển động
  const audioBtn = document.getElementById("toggle-audio");
  audioBtn.addEventListener("click", () => {
    const active = window.gardenAudio.toggle();
    audioBtn.setAttribute("aria-pressed", String(active));
    audioBtn.querySelector(".control-label").textContent = active ? "Âm thanh: Bật" : "Âm thanh: Tắt";
  });

  const motionBtn = document.getElementById("toggle-motion");
  let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  motionBtn.addEventListener("click", () => {
    reducedMotion = !reducedMotion;
    document.body.classList.toggle("reduced-motion", reducedMotion);
    particleSystem.setReducedMotion(reducedMotion);
    motionBtn.setAttribute("aria-pressed", String(reducedMotion));
    motionBtn.querySelector(".control-label").textContent = reducedMotion ? "Chuyển động: Nhẹ" : "Chuyển động: Mượt";
  });

  // 3. Ánh sáng dịu theo con trỏ chuột (không tạo vệt/dòng lệnh đi theo), Parallax & Magnetic Buttons
  const cursorLight = document.getElementById("cursor-light");
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;

  window.addEventListener("mousemove", (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    if (reducedMotion || !cursorLight) return;

    const nx = (e.clientX / window.innerWidth - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    document.querySelectorAll(".parallax-layer").forEach((layer) => {
      const depth = parseFloat(layer.dataset.depth || "0.02");
      layer.style.transform = `translate3d(${nx * depth * -300}px, ${ny * depth * -200}px, 0)`;
    });
  });

  function animateCursorLight() {
    if (cursorLight && !reducedMotion) {
      currentX += (targetX - currentX) * 0.14;
      currentY += (targetY - currentY) * 0.14;
      cursorLight.style.left = `${currentX}px`;
      cursorLight.style.top = `${currentY}px`;
    }
    requestAnimationFrame(animateCursorLight);
  }
  animateCursorLight();

  document.querySelectorAll(".magnetic").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      if (reducedMotion) return;
      const rect = el.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width / 2) * 0.22;
      const dy = (e.clientY - rect.top - rect.height / 2) * 0.22;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  });

  // 4. MÀN HÌNH MỞ ĐẦU: THE FIRST LIGHT
  const introBook = document.getElementById("intro-book");
  const line1El = document.getElementById("typewriter-line-1");
  const line2El = document.getElementById("typewriter-line-2");
  const introTitle = document.getElementById("intro-title");
  const openGardenBtn = document.getElementById("btn-open-garden");

  function typeText(el, text, speed = 36) {
    return new Promise((resolve) => {
      if (reducedMotion) {
        el.textContent = text;
        resolve();
        return;
      }
      let i = 0;
      const timer = setInterval(() => {
        el.textContent += text.charAt(i);
        i++;
        if (i >= text.length) {
          clearInterval(timer);
          resolve();
        }
      }, speed);
    });
  }

  async function runIntroSequence() {
    await new Promise((r) => setTimeout(r, 700));
    introBook.classList.add("is-open");
    await new Promise((r) => setTimeout(r, 1200));
    await typeText(line1El, "Trong hành trình trưởng thành của mỗi người, luôn có những người âm thầm thắp sáng con đường...");
    await new Promise((r) => setTimeout(r, 350));
    await typeText(line2El, "Và hôm nay, chúng ta dành một ngày thật đặc biệt để nói lời cảm ơn.");
    introTitle.classList.add("revealed");
    await new Promise((r) => setTimeout(r, 400));
    openGardenBtn.classList.add("revealed");
  }

  runIntroSequence();

  const sceneIntro = document.getElementById("scene-intro");
  const sceneGarden = document.getElementById("scene-garden");

  openGardenBtn.addEventListener("click", (e) => {
    window.gardenAudio.playChime();
    particleSystem.spawnStarBurst(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2, 28);
    introBook.classList.add("pages-flying");
    sceneIntro.classList.add("transitioning-out");

    setTimeout(() => {
      sceneIntro.hidden = true;
      sceneGarden.hidden = false;
      particleSystem.setMode("garden");
      requestAnimationFrame(() => sceneGarden.classList.add("visible"));
    }, 1250);
  });

  // 5. INTERACTION 1 – THE TREE OF GRATITUDE
  const leavesData = [
    { x: 24, y: 34, rot: -28, quote: "Cảm ơn thầy cô vì đã luôn kiên nhẫn.", sub: "Từng nét chữ, từng bài giảng đều được thắp lên bằng sự tận tâm không mỏi mệt." },
    { x: 37, y: 21, rot: -15, quote: "Cảm ơn vì đã tin tưởng chúng em.", sub: "Ngay cả khi chúng em còn nhiều vụng về và hoài nghi chính mình." },
    { x: 50, y: 17, rot: 8, quote: "Cảm ơn vì những bài học không chỉ nằm trong sách vở.", sub: "Đó là bài học về lòng nhân ái, sự tử tế và bản lĩnh bước vào đời." },
    { x: 64, y: 22, rot: 24, quote: "Một lời động viên có thể thay đổi cả một hành trình.", sub: "Ánh mắt khích lệ năm ấy vẫn luôn soi đường cho chúng em hôm nay." },
    { x: 76, y: 33, rot: 35, quote: "Người gieo hạt thầm lặng giữa mùa thu tháng Mười Một.", sub: "Dẫu năm tháng trôi qua, khu vườn tri thức thầy cô vun trồng vẫn mãi xanh tươi." },
    { x: 20, y: 47, rot: -38, quote: "Cảm ơn vì đã lắng nghe những ước mơ còn dang dở.", sub: "Và chắp cánh để những ước mơ ấy đủ dũng khí bay cao." },
    { x: 45, y: 31, rot: -10, quote: "Mỗi trang giáo án là một ngọn đèn nhỏ.", sub: "Thắp sáng cả một bầu trời tuổi trẻ của bao thế hệ học trò." },
    { x: 58, y: 36, rot: 18, quote: "Hạnh phúc lớn nhất là được làm học trò của thầy cô.", sub: "Kính chúc thầy cô luôn bình an, mạnh khỏe và trọn vẹn niềm vui đứng lớp." }
  ];

  const leavesContainer = document.getElementById("glowing-leaves-container");
  const leafWhisper = document.getElementById("leaf-whisper");
  const leafModal = document.getElementById("leaf-card-modal");
  const leafQuoteEl = document.getElementById("leaf-card-quote");
  const leafSubEl = document.getElementById("leaf-card-sub");

  leavesData.forEach((item, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "glow-leaf";
    btn.style.left = `${item.x}%`;
    btn.style.top = `${item.y}%`;
    btn.style.setProperty("--rot", `${item.rot}deg`);
    btn.style.setProperty("--delay", `${index * 0.45}s`);
    btn.setAttribute("aria-label", item.quote);

    btn.addEventListener("mouseenter", () => {
      leafWhisper.textContent = `“${item.quote}”`;
      leafWhisper.classList.add("active");
    });

    btn.addEventListener("mouseleave", () => {
      leafWhisper.classList.remove("active");
    });

    btn.addEventListener("click", (e) => {
      window.gardenAudio.playPageTurn();
      particleSystem.spawnStarBurst(e.clientX, e.clientY, 16);
      leafQuoteEl.textContent = `“${item.quote}”`;
      leafSubEl.textContent = item.sub;
      leafModal.hidden = false;
    });

    leavesContainer.appendChild(btn);
  });

  leafModal.querySelector(".modal-close").addEventListener("click", () => (leafModal.hidden = true));
  leafModal.querySelector(".modal-backdrop").addEventListener("click", () => (leafModal.hidden = true));

  // 6. INTERACTION 2 – THE MEMORY PORTALS
  const portalViewer = document.getElementById("portal-viewer");
  const portalContents = document.querySelectorAll(".portal-content");
  const chalkTextEl = document.getElementById("chalk-text");

  const polaroidMemories = [
    {
      title: "Tiết học cuối năm",
      note: "Tiếng trống trường vang lên khép lại một mùa hạ, nhưng lời dặn dò của thầy cô vẫn còn mãi.",
      gradient: "linear-gradient(135deg, #183D35, #D8B56D)",
      symbol: "✦"
    },
    {
      title: "Dòng lưu bút mực tím",
      note: "Những trang vở cũ vẫn giữ nguyên nét chữ đỏ ân cần chỉnh sửa từng lỗi nhỏ cho chúng em.",
      gradient: "linear-gradient(135deg, #101B2D, #C98E91)",
      symbol: "❀"
    },
    {
      title: "Nụ cười trên bục giảng",
      note: "Khoảnh khắc thầy cô mỉm cười khi cả lớp hiểu bài là ký ức đẹp nhất của tuổi học trò.",
      gradient: "linear-gradient(135deg, #2a3b4c, #D8B56D)",
      symbol: "☀"
    }
  ];

  const polaroidGallery = document.getElementById("polaroid-gallery");
  const polaroidCaption = document.getElementById("polaroid-caption-display");

  function renderPolaroids() {
    polaroidGallery.innerHTML = "";
    polaroidMemories.forEach((mem) => {
      const card = document.createElement("div");
      card.className = "polaroid-item";
      card.tabIndex = 0;

      if (mem.imgSrc) {
        const img = document.createElement("img");
        img.src = mem.imgSrc;
        img.alt = mem.title;
        card.appendChild(img);
      } else {
        const art = document.createElement("div");
        art.className = "polaroid-art";
        art.style.background = mem.gradient;
        art.style.color = "#F4EBDD";
        art.style.fontSize = "3rem";
        art.textContent = mem.symbol;
        card.appendChild(art);
      }

      const label = document.createElement("span");
      label.textContent = mem.title;
      card.appendChild(label);

      card.addEventListener("mousemove", (e) => {
        if (reducedMotion) return;
        const r = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top) / r.height - 0.5) * -14;
        const ry = ((e.clientX - r.left) / r.width - 0.5) * 14;
        card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
      card.addEventListener("click", () => {
        window.gardenAudio.playPageTurn();
        polaroidCaption.textContent = `“${mem.note}”`;
      });

      polaroidGallery.appendChild(card);
    });
  }

  renderPolaroids();

  // Thay ảnh Polaroid bằng ảnh người dùng tải lên
  document.getElementById("upload-polaroid-input").addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      polaroidMemories[0].imgSrc = ev.target.result;
      polaroidMemories[0].title = "Kỷ niệm của chúng ta";
      polaroidMemories[0].note = "Một khoảnh khắc quý giá được lưu giữ mãi trong Khu Vườn Tri Ân.";
      renderPolaroids();
      polaroidCaption.textContent = `“${polaroidMemories[0].note}”`;
    };
    reader.readAsDataURL(file);
  });

  document.querySelectorAll(".portal-gateway").forEach((portalBtn) => {
    portalBtn.addEventListener("click", (e) => {
      const key = portalBtn.dataset.portal;
      window.gardenAudio.playChime();
      particleSystem.spawnStarBurst(e.clientX, e.clientY, 18);

      portalContents.forEach((c) => (c.hidden = true));
      const targetView = document.getElementById(`view-${key}`);
      if (targetView) targetView.hidden = false;
      portalViewer.hidden = false;

      if (key === "first-lesson") {
        chalkTextEl.textContent = "";
        typeText(
          chalkTextEl,
          "Có những bài học kết thúc sau một tiết học, nhưng cũng có những bài học theo chúng ta suốt cuộc đời.",
          34
        );
      }
    });
  });

  document.getElementById("close-portal-viewer").addEventListener("click", () => {
    portalViewer.hidden = true;
  });

  // 7. INTERACTION 4 – THE BLOOMING SURPRISE
  const flowerBtn = document.getElementById("magic-flower-btn");
  const bloomBox = document.getElementById("bloom-message-box");
  flowerBtn.addEventListener("click", (e) => {
    const isBloomed = flowerBtn.classList.toggle("is-bloomed");
    flowerBtn.setAttribute("aria-expanded", String(isBloomed));
    if (isBloomed) {
      window.gardenAudio.playChime();
      particleSystem.spawnStarBurst(e.clientX, e.clientY, 32);
      bloomBox.hidden = false;
      flowerBtn.querySelector(".flower-hint").textContent = "Đóa hoa đã nở rộ";
    }
  });

  // 8. ĐIỀU HƯỚNG & REVISIT THE GARDEN
  const dots = document.querySelectorAll(".chapter-dots .dot");
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const target = document.getElementById(dot.dataset.target);
      target?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    });
  });

  const chapters = document.querySelectorAll(".garden-chapter");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          dots.forEach((d) => d.classList.toggle("active", d.dataset.target === entry.target.id));
        }
      });
    },
    { threshold: 0.45 }
  );
  chapters.forEach((ch) => observer.observe(ch));

  document.getElementById("btn-revisit").addEventListener("click", (e) => {
    window.gardenAudio.playChime();
    particleSystem.spawnStarBurst(e.clientX, e.clientY, 20);
    document.getElementById("chapter-tree").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  });
});
