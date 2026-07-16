import { authHeaders } from "./authService";

const API_URL = `${import.meta.env.VITE_API_URL}/api/service-requests`;

export const createServiceRequest = async (data) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getServiceRequests = async () => {
  const res = await fetch(API_URL, { headers: authHeaders() });
  return res.json();
};

export const updateServiceRequestStatus = async (id, status) => {
  const res = await fetch(`${API_URL}/${id}/status`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  return res.json();
};

export const deleteServiceRequest = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
};
