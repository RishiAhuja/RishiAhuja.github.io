// Shared by the build and the browser, so it must not import build-only modules.
export const BIRTH_DATE = '2007-10-03';

export const ageOn = (birthDate: string, today: Date) => {
  const [year, month, day] = birthDate.split('-').map(Number);
  const hadBirthday = today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day);
  return today.getFullYear() - year - (hadBirthday ? 0 : 1);
};
