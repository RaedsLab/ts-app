import { TrySuccess } from "../try";

const minLength = 8;
const minNumeric = 1;

export const requirements = `>= ${minLength} characters, >${minNumeric} number`;

export const validatePasswordRequirements = (
  password: string
): TrySuccess<undefined> => {
  if (password.length < minLength) {
    return {
      success: false,
      error: `Must be at least ${minLength} characters`,
    };
  }

  const chars = password.split("").filter((char) => !isNaN(parseInt(char, 10)));
  if (chars.length < minNumeric) {
    return {
      success: false,
      error: `Must have at least ${minNumeric} number`,
    };
  }

  return { success: true };
};
