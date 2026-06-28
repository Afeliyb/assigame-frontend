import { apiFetch } from "./config";
import type { ApiCategorieProduit } from "./types";
import { mapCategorie } from "./adapters";
import type { Category } from "@/lib/types";

export async function fetchCategories(): Promise<Category[]> {
  const data = await apiFetch<ApiCategorieProduit[]>(`/categorieproduit/list`);
  return data.map(mapCategorie);
}
