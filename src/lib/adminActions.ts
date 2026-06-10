"use server";

import fs from "fs";
import path from "path";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_PASSWORD = "pado2025";
const DATA_DIR = path.join(process.cwd(), "src", "data");

// ===== 인증 =====
export async function loginAction(formData: FormData) {
  const pw = formData.get("password") as string;
  if (pw === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set("admin_auth", "true", {
      httpOnly: true,
      maxAge: 60 * 60 * 8, // 8시간
      path: "/",
    });
    redirect("/admin/dashboard");
  } else {
    redirect("/admin?error=1");
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_auth");
  redirect("/admin");
}

export async function checkAuth() {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin_auth");
  if (!auth || auth.value !== "true") {
    redirect("/admin");
  }
}

// ===== 파일 읽기/쓰기 유틸 =====
function readJson(filename: string) {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

function writeJson(filename: string, data: unknown) {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ===== 투어 CRUD =====
export async function getTours() {
  return readJson("tours.json");
}

export async function saveTour(formData: FormData) {
  await checkAuth();
  const tours = readJson("tours.json");
  const id = formData.get("id") as string;
  const isEdit = tours.some((t: { id: string }) => t.id === id);

  const tour = {
    id,
    country: formData.get("country") as string,
    countryCode: formData.get("countryCode") as string,
    region: formData.get("region") as string,
    title: formData.get("title") as string,
    nights: Number(formData.get("nights")),
    days: Number(formData.get("days")),
    courses: Number(formData.get("courses")),
    roundsIncluded: Number(formData.get("roundsIncluded")),
    highlights: (formData.get("highlights") as string).split("\n").map(s => s.trim()).filter(Boolean),
    includes: (formData.get("includes") as string).split("\n").map(s => s.trim()).filter(Boolean),
    excludes: (formData.get("excludes") as string).split("\n").map(s => s.trim()).filter(Boolean),
    price: formData.get("price") as string,
    image: formData.get("image") as string,
    badge: formData.get("badge") as string,
    departure: formData.get("departure") as string,
  };

  if (isEdit) {
    const idx = tours.findIndex((t: { id: string }) => t.id === id);
    tours[idx] = tour;
  } else {
    tours.push(tour);
  }

  writeJson("tours.json", tours);
  redirect("/admin/tours");
}

export async function deleteTour(id: string) {
  await checkAuth();
  const tours = readJson("tours.json");
  const updated = tours.filter((t: { id: string }) => t.id !== id);
  writeJson("tours.json", updated);
}

// ===== 후기 CRUD =====
export async function getReviews() {
  return readJson("reviews.json");
}

export async function saveReview(formData: FormData) {
  await checkAuth();
  const reviews = readJson("reviews.json");
  const id = formData.get("id") as string;
  const isEdit = reviews.some((r: { id: string }) => r.id === id);

  const review = {
    id,
    name: formData.get("name") as string,
    country: formData.get("country") as string,
    countryCode: formData.get("countryCode") as string,
    rating: Number(formData.get("rating")),
    comment: formData.get("comment") as string,
    date: formData.get("date") as string,
  };

  if (isEdit) {
    const idx = reviews.findIndex((r: { id: string }) => r.id === id);
    reviews[idx] = review;
  } else {
    reviews.push(review);
  }

  writeJson("reviews.json", reviews);
  redirect("/admin/reviews");
}

export async function deleteReview(id: string) {
  await checkAuth();
  const reviews = readJson("reviews.json");
  const updated = reviews.filter((r: { id: string }) => r.id !== id);
  writeJson("reviews.json", updated);
}

// ===== 공지 CRUD =====
export async function getNotices() {
  return readJson("notices.json");
}

export async function saveNotice(formData: FormData) {
  await checkAuth();
  const notices = readJson("notices.json");
  const id = formData.get("id") as string;
  const isEdit = notices.some((n: { id: string }) => n.id === id);

  const notice = {
    id,
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    date: formData.get("date") as string,
    isEvent: formData.get("isEvent") === "true",
  };

  if (isEdit) {
    const idx = notices.findIndex((n: { id: string }) => n.id === id);
    notices[idx] = notice;
  } else {
    notices.push(notice);
  }

  writeJson("notices.json", notices);
  redirect("/admin/notices");
}

export async function deleteNotice(id: string) {
  await checkAuth();
  const notices = readJson("notices.json");
  const updated = notices.filter((n: { id: string }) => n.id !== id);
  writeJson("notices.json", updated);
}
