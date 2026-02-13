import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// import appConfig from '../config/appConfig';
import appConfig from '../../config/appConfig';
export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${appConfig.apiUrl}v1/user`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token; // cite: [9]
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["UserStatus"],
  endpoints: (builder) => ({
    getRegistrationStatus: builder.query({
      query: (userId) => `/status/${userId}`,
      providesTags: ["UserStatus"],
    }),
    createUserProfile: builder.mutation({
      query: (data) => ({ url: "/users", method: "POST", body: data }),
      invalidatesTags: ["UserStatus"],
    }),
    addContact: builder.mutation({
      query: (data) => ({ url: "/contact", method: "POST", body: data }),
      invalidatesTags: ["UserStatus"],
    }),
    addAddress: builder.mutation({
      query: (data) => ({ url: "/address", method: "POST", body: data }),
      invalidatesTags: ["UserStatus"],
    }),
    addSettings: builder.mutation({
      query: (data) => ({ url: "/settings", method: "POST", body: data }), // Note: Ensure route matches your express router
      invalidatesTags: ["UserStatus"],
    }),
    // Add to your userApi or a new locationApi
    // getCountries: builder.query({
    //   query: () => "/countries", // Returns [{ id, name, emoji }]
    // }),
    // getCitiesByCountry: builder.query({
    //   query: (countryId) => `/cities/${countryId}`, // Returns [{ id, name }]
    // }),
    // getCurrencies: builder.query({
    //   query: () => '/currencies',
    //   // Since currency data is static, we can cache it for a long time
    //   keepUnusedDataFor: 3600, 
    // }),
  }),
});

export const {
  useGetRegistrationStatusQuery,
  useCreateUserProfileMutation,
  useAddContactMutation,
  useAddAddressMutation,
  useAddSettingsMutation,
//   useGetCitiesByCountryQuery,
//   useGetCountriesQuery,
//   useGetCurrenciesQuery
} = userApi;
