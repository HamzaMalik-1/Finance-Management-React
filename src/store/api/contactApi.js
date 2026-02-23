import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import appConfig from '../../config/appConfig';

export const contactApi = createApi({
  reducerPath: 'contactApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${appConfig.apiUrl}v1/contacts` }), // Adjust path
  tagTypes: ['Contact'],
  endpoints: (builder) => ({
    getContacts: builder.query({
      query: (userId) => `/user/${userId}`,
      providesTags: ['Contact'],
    }),
    updateContact: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Contact'],
    }),
  }),
});

export const { useGetContactsQuery, useUpdateContactMutation } = contactApi;