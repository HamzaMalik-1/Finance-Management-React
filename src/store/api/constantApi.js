import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import appConfig from '../../config/appConfig';

export const constantApi = createApi({
  reducerPath: "constantApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${appConfig.apiUrl}v1/constant`, // ✅ Pointing to the constant router
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
   getCountries: builder.query({
      query: () => "/countries",
      keepUnusedDataFor: 3600, // Cache for 1 hour
    }),
    getCities: builder.query({
      query: (countryId) => ({
        url: "/cities",
        params: { countryId }, // Sends as ?countryId=X
      }),
    }),
    getCurrencies: builder.query({
      query: () => '/currencies',
      keepUnusedDataFor: 3600, 
    }),
  }),
});

export const {
  useGetCountriesQuery,
  useGetCitiesQuery,
  useGetCurrenciesQuery
} = constantApi;