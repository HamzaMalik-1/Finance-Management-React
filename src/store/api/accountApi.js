import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import appConfig from '../../config/appConfig';

export const accountApi = createApi({
  reducerPath: "accountApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${appConfig.apiUrl}v1/user-account`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Accounts"],
  endpoints: (builder) => ({
    getAccounts: builder.query({
      query: (userId) => `/user/${userId}`,
      providesTags: ["Accounts"],
    }),
    addAccount: builder.mutation({
      query: (data) => ({ url: "/", method: "POST", body: data }),
      invalidatesTags: ["Accounts"],
    }),
    updateAccount: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/${id}`, method: "PUT", body: data }),
      invalidatesTags: ["Accounts"],
    }),

     deleteAccount: builder.mutation({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: ["Accounts"],
    }),
  }),
});

export const { useGetAccountsQuery, useAddAccountMutation, useUpdateAccountMutation,useDeleteAccountMutation } = accountApi;