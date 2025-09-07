export function generateRandomPassword(): string {
  const length = 12;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";

  // Ensure at least one character from each category
  password += charset.charAt(Math.floor(Math.random() * 26)); // lowercase
  password += charset.charAt(26 + Math.floor(Math.random() * 26)); // uppercase
  password += charset.charAt(52 + Math.floor(Math.random() * 10)); // number
  password += charset.charAt(62 + Math.floor(Math.random() * 8)); // special char

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}
