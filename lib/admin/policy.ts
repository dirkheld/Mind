export function isAdminEmail(email: string | null | undefined, configured = process.env.ADMIN_EMAILS ?? "") {
  const allowed = configured.split(",").map(value => value.trim().toLowerCase()).filter(Boolean);
  return !!email && allowed.includes(email.trim().toLowerCase());
}
