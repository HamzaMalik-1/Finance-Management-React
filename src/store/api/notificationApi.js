import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import appConfig from '../../config/appConfig';

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${appConfig.apiUrl}v1/notification`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Notifications"],
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: (userId) => `/${userId}`,
      providesTags: ["Notifications"],
    }),
    markRead: builder.mutation({
      query: (id) => ({ 
        url: `/${id}/read`, 
        method: "PATCH" 
      }),
      invalidatesTags: ["Notifications"],
    }),
    markAllRead: builder.mutation({
      query: (userId) => ({ 
        url: "/mark-all-read", 
        method: "POST", 
        body: { userId } 
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const { 
  useGetNotificationsQuery, 
  useMarkReadMutation, 
  useMarkAllReadMutation 
} = notificationApi;