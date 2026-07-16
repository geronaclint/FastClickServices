import { authHeaders } from "./authService";

const API_URL = `${import.meta.env.VITE_API_URL}/api/ratings`;

export const submitRating = async (itemType, itemId, rating, review = "") => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ itemType, itemId, rating, review }),
  });
  return res.json();
};

export const getRating = async (itemType, itemId) => {
  const res = await fetch(`${API_URL}/${itemType}/${itemId}`, {
    headers: authHeaders(),
  });
  return res.json();
};

export const getBulkRatings = async (itemType, ids) => {
  if (!ids || ids.length === 0) return { success: true, data: [] };
  const res = await fetch(`${API_URL}/bulk?itemType=${itemType}&ids=${ids.join(',')}`, {
    headers: authHeaders(),
  });
  return res.json();
};
