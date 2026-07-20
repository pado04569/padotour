import { MetadataRoute } from "next";
import { tours } from "@/data/tours";
import { courses } from "@/data/courses";

const BASE_URL = "https://www.padotour.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: `${BASE_URL}/`, priority: 1 },
    { url: `${BASE_URL}/incheon`, priority: 0.9 },
    { url: `${BASE_URL}/busan`, priority: 0.9 },
    { url: `${BASE_URL}/tours`, priority: 0.9 },
    { url: `${BASE_URL}/guide/matsuyama`, priority: 0.9 },
    { url: `${BASE_URL}/courses`, priority: 0.8 },
    { url: `${BASE_URL}/reviews`, priority: 0.7 },
    { url: `${BASE_URL}/notice`, priority: 0.5 },
    { url: `${BASE_URL}/about`, priority: 0.5 },
  ].map((page) => ({
    url: page.url,
    lastModified: new Date(),
    priority: page.priority,
  }));

  const tourPages = tours.map((tour) => ({
    url: `${BASE_URL}/tours/${tour.id}`,
    lastModified: new Date(),
    priority: 0.8,
  }));

  const coursePages = courses.map((course) => ({
    url: `${BASE_URL}/courses/${course.slug}`,
    lastModified: new Date(),
    priority: 0.7,
  }));

  return [...staticPages, ...tourPages, ...coursePages];
}
