import { cookies } from "next/headers";
import { adminPassword, SESSION_COOKIE, validSession } from "./photo-session";

export async function isPhotoAdmin() {
  const password = adminPassword();
  return !!password && validSession((await cookies()).get(SESSION_COOKIE)?.value, password);
}
