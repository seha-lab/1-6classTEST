function parseBirthdayText(value) {
  if (!value || value === "null") return null;

  const [month, day] = String(value).split(".").map(Number);

  if (!month || !day) return null;

  return { month, day };
}

function createBirthdayData() {
  const students = Object.values(STUDENT || {})
    .map((person) => {
      const parsed = parseBirthdayText(person.birthday);
      if (!parsed) return null;

      return {
        name: person.name,
        month: parsed.month,
        day: parsed.day,
        note: "",
      };
    })
    .filter(Boolean);

  const teachers = Object.entries(TEACHER || {})
    .map(([name, birthday]) => {
      const parsed = parseBirthdayText(birthday);
      if (!parsed) return null;

      return {
        name,
        month: parsed.month,
        day: parsed.day,
        note: "",
      };
    })
    .filter(Boolean);

  return {
    students,
    teachers,
  };
}

const birthdayData = createBirthdayData();
