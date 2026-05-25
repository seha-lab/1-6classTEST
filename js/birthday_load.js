function hasFinalConsonant(word) {
  if (!word || typeof word !== "string") return false;

  const lastChar = word.trim().slice(-1);
  const code = lastChar.charCodeAt(0);

  // 한글 음절 범위
  if (code < 0xac00 || code > 0xd7a3) {
    return false;
  }

  // 종성 유무 판정
  return (code - 0xac00) % 28 !== 0;
}

function getAndParticle(word) {
  return hasFinalConsonant(word) ? "과" : "와";
}
/* =========================
   공통 유틸
========================= */

function getAllBirthdayPeople() {
  const students = birthdayData.students.map((person) => ({
    ...person,
    type: "student",
  }));

  const teachers = birthdayData.teachers.map((person) => ({
    ...person,
    type: "teacher",
  }));

  return [...students, ...teachers];
}

function getMonthDayKey(month, day) {
  return `${month}-${day}`;
}

function normalizeDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getNextBirthdayDate(month, day, baseDate = new Date()) {
  const today = normalizeDate(baseDate);
  let target = new Date(today.getFullYear(), month - 1, day);

  if (target < today) {
    target = new Date(today.getFullYear() + 1, month - 1, day);
  }

  return target;
}

function getDiffDays(targetDate, baseDate = new Date()) {
  const start = normalizeDate(baseDate);
  const target = normalizeDate(targetDate);
  const diffMs = target - start;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function groupPeopleByType(people) {
  return {
    students: people.filter((p) => p.type === "student"),
    teachers: people.filter((p) => p.type === "teacher"),
  };
}

function joinNames(names) {
  return names.join(", ");
}

function formatBirthdayTarget(people) {
  const { students, teachers } = groupPeopleByType(people);

  const studentNames = students.map((p) => p.name);
  const teacherNames = teachers.map((p) =>
    p.name.endsWith("선생님") ? p.name : `${p.name}선생님`,
  );

  if (studentNames.length > 0 && teacherNames.length > 0) {
    const lastStudentName = studentNames[studentNames.length - 1];
    const particle = getAndParticle(lastStudentName);

    return `${joinNames(studentNames)}${particle} ${joinNames(teacherNames)}`;
  }

  if (studentNames.length > 0) {
    return joinNames(studentNames);
  }

  if (teacherNames.length > 0) {
    return joinNames(teacherNames);
  }

  return "";
}

function collectNotes(people) {
  return people
    .map((p) => p.note)
    .filter((note) => typeof note === "string" && note.trim() !== "");
}

/* =========================
   날짜 기준 조회
========================= */

function getTodayBirthdayPeople() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  return getAllBirthdayPeople().filter(
    (person) => person.month === month && person.day === day,
  );
}

function getUpcomingBirthdayPeople(daysBefore = 7) {
  const today = new Date();

  return getAllBirthdayPeople().filter((person) => {
    const nextBirthday = getNextBirthdayDate(person.month, person.day, today);
    const diffDays = getDiffDays(nextBirthday, today);
    return diffDays === daysBefore;
  });
}

/* =========================
   문구 생성
========================= */

function buildBirthdayMessage(people, mode = "today") {
  if (!people || people.length === 0) {
    return null;
  }

  const targetText = formatBirthdayTarget(people);
  const onlyTeachers = people.every((p) => p.type === "teacher");
  const notes = collectNotes(people);

  let title = "";
  let desc = "";

  if (mode === "today") {
    title = `🎂 오늘은 ${targetText}의 생일입니다!`;

    if (onlyTeachers) {
      desc = "진심으로 생신을 축하드립니다! 🎉";
    } else {
      desc = "다 같이 축하해 주세요 🎉";
    }
  } else if (mode === "upcoming") {
    title = `🎉 일주일 뒤는 ${targetText}의 생일입니다!`;

    if (onlyTeachers) {
      desc = "미리 생신 축하를 준비해 보세요 ✨";
    } else {
      desc = "미리 축하 준비를 해 보세요 ✨";
    }
  }

  if (notes.length > 0) {
    desc += `\n\n${notes.join("\n")}`;
  }

  return { title, desc };
}

/* =========================
   팝업 UI
========================= */

function ensureBirthdayAlertStyle() {
  if (document.getElementById("birthdayAlertStyle")) return;

  const style = document.createElement("style");
  style.id = "birthdayAlertStyle";
  style.textContent = `
    .birthday-alert-overlay {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(6px);
      opacity: 1;
      transition: opacity 0.22s ease;
    }

    .birthday-alert-overlay.hide {
      opacity: 0;
    }

    .birthday-alert-modal {
      width: min(92vw, 520px);
      border-radius: 24px;
      padding: 28px 22px 22px;
      background: rgba(255, 255, 255, 0.96);
      box-shadow: 0 18px 60px rgba(0, 0, 0, 0.22);
      text-align: center;
      color: #1f2937;
      animation: birthdayPopIn 0.25s ease;
      white-space: pre-line;
    }

    .birthday-alert-icon {
      font-size: 52px;
      line-height: 1;
      margin-bottom: 14px;
    }

    .birthday-alert-title {
      font-size: 24px;
      font-weight: 800;
      line-height: 1.45;
      margin-bottom: 12px;
    }

    .birthday-alert-desc {
      font-size: 16px;
      line-height: 1.7;
      color: #4b5563;
      margin-bottom: 18px;
    }

    .birthday-alert-close {
      border: 0;
      border-radius: 999px;
      padding: 12px 22px;
      background: #111827;
      color: #ffffff;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
    }

    .birthday-alert-close:hover {
      opacity: 0.92;
    }

    @keyframes birthdayPopIn {
      from {
        transform: translateY(8px) scale(0.97);
        opacity: 0;
      }
      to {
        transform: translateY(0) scale(1);
        opacity: 1;
      }
    }
  `;

  document.head.appendChild(style);
}

function showBirthdayPopup(title, desc) {
  ensureBirthdayAlertStyle();

  const oldPopup = document.getElementById("birthdayAlertOverlay");
  if (oldPopup) oldPopup.remove();

  const overlay = document.createElement("div");
  overlay.id = "birthdayAlertOverlay";
  overlay.className = "birthday-alert-overlay";

  overlay.innerHTML = `
    <div class="birthday-alert-modal">
      <div class="birthday-alert-icon">🎂</div>
      <div class="birthday-alert-title"></div>
      <div class="birthday-alert-desc"></div>
      <button class="birthday-alert-close" type="button">닫기</button>
    </div>
  `;

  overlay.querySelector(".birthday-alert-title").textContent = title;
  overlay.querySelector(".birthday-alert-desc").textContent = desc;

  document.body.appendChild(overlay);

  const close = () => {
    overlay.classList.add("hide");
    setTimeout(() => {
      overlay.remove();
    }, 220);
  };

  overlay
    .querySelector(".birthday-alert-close")
    .addEventListener("click", close);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      close();
    }
  });
}

/* =========================
   실행
========================= */

function showBirthdayAlert() {
  const todayPeople = getTodayBirthdayPeople();
  if (todayPeople.length > 0) {
    const msg = buildBirthdayMessage(todayPeople, "today");
    if (msg) {
      showBirthdayPopup(msg.title, msg.desc);
      return;
    }
  }

  const upcomingPeople = getUpcomingBirthdayPeople(7);
  if (upcomingPeople.length > 0) {
    const msg = buildBirthdayMessage(upcomingPeople, "upcoming");
    if (msg) {
      showBirthdayPopup(msg.title, msg.desc);
    }
  }
}

window.addEventListener("load", () => {
  showBirthdayAlert();
});
