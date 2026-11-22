// Quản lý Sổ Tay Tri Ân, Local Storage và xuất ảnh thiệp PNG chất lượng cao
(function initGreetingCardModule() {
  const STORAGE_KEY = "timeless_garden_gratitude_v1";

  const editorEl = document.getElementById("notebook-editor");
  const completedEl = document.getElementById("completed-card-wrapper");
  const cardArtifact = document.getElementById("rendered-greeting-card");

  const teacherInput = document.getElementById("teacher-name");
  const senderInput = document.getElementById("sender-name");
  const messageInput = document.getElementById("gratitude-message");

  const outTeacher = document.getElementById("out-teacher");
  const outSender = document.getElementById("out-sender");
  const outMessage = document.getElementById("out-message");
  const feedbackEl = document.getElementById("card-feedback");

  let selectedStyle = "ivory";
  let selectedInk = "#101B2D";

  // Chọn phong cách thiệp
  document.querySelectorAll("#card-style-options .style-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#card-style-options .style-chip").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedStyle = btn.dataset.style;
    });
  });

  // Chọn màu mực
  document.querySelectorAll("#ink-color-options .swatch").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#ink-color-options .swatch").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedInk = btn.dataset.ink;
      messageInput.style.color = selectedInk;
    });
  });

  function typeInkEffect(element, text) {
    element.textContent = "";
    let idx = 0;
    const timer = setInterval(() => {
      element.textContent += text.charAt(idx);
      idx++;
      if (idx >= text.length) clearInterval(timer);
    }, 24);
  }

  function renderCard(data, animate = true) {
    cardArtifact.className = `greeting-card-artifact style-${data.style}`;
    outTeacher.textContent = data.teacher || "Thầy Cô kính mến";
    outSender.textContent = data.sender || "Học trò của Thầy Cô";

    const inkColor = data.style === "navy" ? "#F4EBDD" : data.ink;
    outMessage.style.color = inkColor;

    editorEl.hidden = true;
    completedEl.hidden = false;

    if (animate) {
      typeInkEffect(outMessage, data.message);
    } else {
      outMessage.textContent = data.message;
    }
  }

  // Khôi phục dữ liệu từ Local Storage nếu có
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      teacherInput.value = parsed.teacher || "";
      senderInput.value = parsed.sender || "";
      messageInput.value = parsed.message || "";
      selectedStyle = parsed.style || "ivory";
      selectedInk = parsed.ink || "#101B2D";
      if (parsed.message) {
        renderCard(parsed, false);
      }
    }
  } catch (e) {
    // Bỏ qua nếu trình duyệt chặn storage
  }

  document.getElementById("btn-submit-gratitude").addEventListener("click", (e) => {
    const message = messageInput.value.trim();
    if (!message) {
      messageInput.focus();
      messageInput.placeholder = "Hãy viết đôi dòng gửi thầy cô trước khi tạo thiệp nhé...";
      return;
    }

    const payload = {
      teacher: teacherInput.value.trim() || "Thầy Cô kính mến",
      sender: senderInput.value.trim() || "Học trò của Thầy Cô",
      message,
      style: selectedStyle,
      ink: selectedInk
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {}

    window.gardenAudio?.playChime();
    if (window.particleSystem) {
      const rect = e.currentTarget.getBoundingClientRect();
      window.particleSystem.spawnStarBurst(rect.left + rect.width / 2, rect.top, 24);
    }

    renderCard(payload, true);
  });

  document.getElementById("btn-new-wish").addEventListener("click", () => {
    completedEl.hidden = true;
    editorEl.hidden = false;
    feedbackEl.textContent = "";
    window.gardenAudio?.playPageTurn();
  });

  document.getElementById("btn-copy-wish").addEventListener("click", async () => {
    const fullText = `Kính gửi ${outTeacher.textContent},

${outMessage.textContent}

Trân trọng,
${outSender.textContent}`;
    try {
      await navigator.clipboard.writeText(fullText);
      feedbackEl.textContent = "Đã sao chép lời chúc vào bộ nhớ tạm.";
    } catch {
      feedbackEl.textContent = "Không thể tự động sao chép, bạn có thể bôi đen trực tiếp trên thiệp.";
    }
  });

  // Xuất thiệp thành ảnh PNG trực tiếp bằng Canvas 2D
  document.getElementById("btn-download-png").addEventListener("click", () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");

    const palettes = {
      ivory: { bg1: "#fbf6ed", bg2: "#ead9be", text: selectedInk, accent: "#D8B56D" },
      navy: { bg1: "#132238", bg2: "#0b1422", text: "#F4EBDD", accent: "#D8B56D" },
      rose: { bg1: "#f9ecec", bg2: "#ebd0d2", text: "#3a1d22", accent: "#C98E91" }
    };
    const theme = palettes[selectedStyle] || palettes.ivory;

    const grad = ctx.createLinearGradient(0, 0, 1200, 800);
    grad.addColorStop(0, theme.bg1);
    grad.addColorStop(1, theme.bg2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 800);

    // Khung viền vàng nghệ thuật
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(48, 48, 1104, 704);
    ctx.lineWidth = 1;
    ctx.strokeRect(62, 62, 1076, 676);

    ctx.fillStyle = "#D8B56D";
    ctx.font = "600 20px 'DM Sans', sans-serif";
    ctx.fillText("20 · 11  —  THE TIMELESS GARDEN", 105, 125);

    ctx.fillStyle = theme.text;
    ctx.font = "600 36px 'Playfair Display', Georgia, serif";
    ctx.fillText(`Kính gửi ${outTeacher.textContent},`, 105, 200);

    // Tự động ngắt dòng lời chúc
    ctx.font = "italic 32px 'Cormorant Garamond', Georgia, serif";
    const words = outMessage.textContent.split(/\s+/);
    let line = "";
    let y = 275;
    const maxWidth = 980;
    for (const word of words) {
      const test = line + word + " ";
      if (ctx.measureText(test).width > maxWidth && line !== "") {
        ctx.fillText(line, 105, y);
        line = word + " ";
        y += 48;
      } else {
        line = test;
      }
    }
    ctx.fillText(line, 105, y);

    ctx.textAlign = "right";
    ctx.font = "italic 28px 'Cormorant Garamond', Georgia, serif";
    ctx.fillText("Trân trọng & Biết ơn,", 1090, 635);
    ctx.font = "700 32px 'Playfair Display', Georgia, serif";
    ctx.fillText(outSender.textContent, 1090, 682);

    const link = document.createElement("a");
    link.download = "thiep-tri-an-20-11.png";
    link.href = canvas.toDataURL("image/png");
    link.click();

    feedbackEl.textContent = "Đã tải tấm thiệp PNG về thiết bị của bạn!";
    window.gardenAudio?.playChime();
  });
})();
