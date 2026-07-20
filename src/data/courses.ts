import coursesData from "./courses.json";

export type Course = {
  slug: string;
  name: string;
  region: string;
  country: string;
  countryCode: string;
  description: string;
  images: string[];
  relatedTourIds: string[];
};

export const courses: Course[] = coursesData as Course[];
