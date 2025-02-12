import axios from "axios";
import { API_BASE_URL } from "./config";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export function useApi() {
  return {
    users: {
      getUser: (userId) => api.get(`/users/${userId}`),
      createUser: (data) => api.post(`/users`, data),
    },

    collections: {
      listByWorkspace: (workspaceId) =>
        api.get(`/collections/workspace/${workspaceId}`),
      get: (workspaceId, collectionId) =>
        api.get(`/collections/workspace/${workspaceId}/${collectionId}`),
      create: (workspaceId, data, userId) =>
        api.post(`/collections/workspace/${workspaceId}/user/${userId}`, data),
      update: (workspaceId, collectionId, data) =>
        api.put(`/collections/workspace/${workspaceId}/${collectionId}`, data),
      delete: (workspaceId, collectionId) =>
        api.delete(`/collections/workspace/${workspaceId}/${collectionId}`),
      generateAIFlashcards: (collectionId, data) =>
        api.post(`/collections/${collectionId}/generate`, data),
    },
    flashcards: {
      listByCollection: (collectionId) =>
        api.get(`/collections/${collectionId}/flashcards`),
      create: (collectionId, data, userId) =>
        api.post(
          `/collections/${collectionId}/flashcards/user/${userId}`,
          data
        ),
      update: (collectionId, flashcardId, data) =>
        api.put(`/collections/${collectionId}/flashcards/${flashcardId}`, data),
      delete: (collectionId, flashcardId) =>
        api.delete(`/collections/${collectionId}/flashcards/${flashcardId}`),
      updateProgress: (collectionId, flashcardId, data) =>
        api.put(
          `/collections/${collectionId}/flashcards/${flashcardId}/progress`,
          data
        ),
      getStats: (collectionId) => api.get(`/collections/${collectionId}/stats`),
      review: (collectionId, flashcardId, data) =>
        api.put(
          `/collections/${collectionId}/flashcards/${flashcardId}/review`,
          data
        ),
      getFlashcardsForReview: async (collectionId) => {
        const response = await api.get(
          `/collections/${collectionId}/flashcards/review`
        );
        return response.data;
      },
      submitReview: (flashcardId, reviewData) =>
        api.put(
          `/collections/${reviewData.collectionId}/flashcards/${flashcardId}/review`,
          reviewData
        ),
      getForReview: (collectionId) =>
        api.get(`/collections/${collectionId}/flashcards/review`),
    },
    studySessions: {
      create: (data) => api.post("/study-sessions", data),
      get: (id) => api.get(`/study-sessions/${id}`),
      addActivity: (sessionId, flashcardId, data) =>
        api.post(
          `/study-sessions/${sessionId}/activities?flashcardId=${flashcardId}`,
          data
        ),
      complete: (id) => api.post(`/study-sessions/${id}/complete`),
    },
    workspaces: {
      listByUser: (userId) => api.get(`/workspaces/user/${userId}`),
      get: (id) => api.get(`/workspaces/${id}`),
      create: (userId, data) => api.post(`/workspaces/user/${userId}`, data),
      update: (id, data) => api.put(`/workspaces/${id}`, data),
      delete: (id) => api.delete(`/workspaces/${id}`),
      invitations: {
        create: (workspaceId, inviteeEmail) =>
          api.post(
            `/workspace-invitations/workspaces/${workspaceId}/invite`,
            null,
            {
              params: { inviteeEmail },
            }
          ),
        process: (token, action) =>
          api.post(`/workspace-invitations/${token}/${action}`),
        getPendingByEmail: (email) =>
          api.get(`/workspace-invitations/pending/email/${email}`),
        getPendingByWorkspace: (workspaceId) =>
          api.get(`/workspace-invitations/pending/workspace/${workspaceId}`),
      },
    },
    workspacePermissions: {
      invite: (data) => api.post(`/workspace-permissions/invite`, data),
      list: (workspaceId) =>
        api.get(`/workspace-permissions/${workspaceId}/users`),
      update: (workspaceId, userId, data) =>
        api.put(`/workspace-permissions/${workspaceId}/users/${userId}`, data),
      remove: (workspaceId, userId) =>
        api.delete(`/workspace-permissions/${workspaceId}/users/${userId}`),
    },
  };
}
