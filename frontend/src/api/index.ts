import axios from "axios";
import type { ChatResponse, AssetListResponse } from "../types";

const api = axios.create({ baseURL: "/api" });

export async function sendChatMessage(content: string): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>("/chat", { content });
  return data;
}

export async function uploadAssets(file: File): Promise<{ message: string; count: number }> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/assets/upload", formData);
  return data;
}

export async function getAssets(page = 1, pageSize = 20): Promise<AssetListResponse> {
  const { data } = await api.get<AssetListResponse>("/assets", {
    params: { page, page_size: pageSize },
  });
  return data;
}

export async function deleteAsset(id: string): Promise<void> {
  await api.delete(`/assets/${id}`);
}

export async function batchDeleteAssets(ids: string[]): Promise<void> {
  await api.post("/assets/batch-delete", ids);
}

export async function getStats(): Promise<{ total_assets: number }> {
  const { data } = await api.get("/assets/stats");
  return data;
}
