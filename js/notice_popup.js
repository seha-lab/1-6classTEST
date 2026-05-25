function getTodayMonthDay() {
  const today = new Date();
  return `${today.getMonth() + 1}/${today.getDate()}`;
}

function getTodayNotices() {
  if (!Array.isArray(notices)) return [];

  const today = getTodayMonthDay();

  return notices.filter((notice) => {
    return notice.enabled !== false && notice.date === today;
  });
}

function ensureNoticePopupStyle() {
  if (document.getElementById("noticePopupStyle")) return;

  const style = document.createElement("style");
  style.id = "noticePopupStyle";
  style.textContent = `
    .notice-overlay {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(6px);
    }

    .notice-modal {
      width: min(92vw, 520px);
      border-radius: 24px;
      padding: 26px 22px 22px;
      background: rgba(255, 255, 255, 0.96);
      box-shadow: 0 18px 60px rgba(0, 0, 0, 0.22);
      color: #1a2540;
      animation: noticePop 0.22s ease;
    }

    .notice-kicker {
      font-size: 13px;
      font-weight: 900;
      color: #5d77c2;
      margin-bottom: 8px;
    }

    .notice-title {
      font-size: 24px;
      font-weight: 900;
      line-height: 1.4;
      margin-bottom: 12px;
    }

    .notice-body {
      font-size: 15px;
      line-height: 1.8;
      color: #4b5c7d;
      white-space: pre-line;
      margin-bottom: 18px;
    }

    .notice-close {
      width: 100%;
      border: 0;
      border-radius: 999px;
      padding: 12px 18px;
      background: #1a2540;
      color: white;
      font-size: 15px;
      font-weight: 800;
      cursor: pointer;
    }

    @keyframes noticePop {
      from { transform: translateY(8px) scale(0.97); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }
  `;

  document.head.appendChild(style);
}

function showNoticePopup(noticeList) {
  if (!noticeList.length) return;

  ensureNoticePopupStyle();

  const overlay = document.createElement("div");
  overlay.className = "notice-overlay";

  const bodyText = noticeList
    .map((notice) => `• ${notice.title}\n${notice.body}`)
    .join("\n\n");

  overlay.innerHTML = `
    <div class="notice-modal">
      <div class="notice-kicker">NOTICE</div>
      <div class="notice-title">오늘의 공지</div>
      <div class="notice-body"></div>
      <button class="notice-close" type="button">확인</button>
    </div>
  `;

  overlay.querySelector(".notice-body").textContent = bodyText;

  const close = () => overlay.remove();

  overlay.querySelector(".notice-close").addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  document.body.appendChild(overlay);
}

window.addEventListener("load", () => {
  showNoticePopup(getTodayNotices());
});
