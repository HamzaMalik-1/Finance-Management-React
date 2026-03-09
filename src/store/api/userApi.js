import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import appConfig from '../../config/appConfig';

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${appConfig.apiUrl}v1/user`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  // ✅ Single consolidated array for all tags used in this slice
  tagTypes: ["UserStatus", "UserSettings", "UserProfile"], 
  endpoints: (builder) => ({
    // Registration & Onboarding
    getRegistrationStatus: builder.query({
      query: (userId) => `/status/${userId}`,
      providesTags: ["UserStatus"],
    }),
    createUserProfile: builder.mutation({
      query: (data) => ({ url: "/users", method: "POST", body: data }),
      invalidatesTags: ["UserStatus"],
    }),

    // Contact & Address
    addContact: builder.mutation({
      query: (data) => ({ url: "/contact", method: "POST", body: data }),
      invalidatesTags: ["UserStatus"],
    }),
    addAddress: builder.mutation({
      query: (data) => ({ url: "/address", method: "POST", body: data }),
      invalidatesTags: ["UserStatus"],
    }),

    // Settings
    addSettings: builder.mutation({
      query: (data) => ({ url: "/settings", method: "POST", body: data }),
      invalidatesTags: ["UserStatus", "UserSettings"],
    }),
    getSettings: builder.query({
      query: (userId) => `/settings/${userId}`,
      providesTags: ["UserSettings"],
    }),
    updateSettings: builder.mutation({
      query: ({ userId, ...body }) => ({
        url: `/settings/${userId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["UserSettings"],
    }),

    // ✅ Profile (Unified with your backend router.get('/profile/:userId'))
    getProfile: builder.query({
      query: (userId) => `/profile/${userId}`,
      providesTags: ["UserProfile"],
    }),
    updateProfile: builder.mutation({
      query: ({ userId, ...body }) => ({
        url: `/profile/${userId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['UserProfile'], 
    }),
  }),
});

export const {
  useGetRegistrationStatusQuery,
  useCreateUserProfileMutation,
  useAddContactMutation,
  useAddAddressMutation,
  useAddSettingsMutation,
  useGetSettingsQuery, 
  useUpdateSettingsMutation,
  useGetProfileQuery,    // ✅ Exported for ProfileTab
  useUpdateProfileMutation,
} = userApi;