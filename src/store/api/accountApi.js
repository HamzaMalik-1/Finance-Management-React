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
  tagTypes: ["Accounts", "AccountDetails"], // Added specific tag for details
  endpoints: (builder) => ({
    getAccounts: builder.query({
      query: (userId) => `/user/${userId}`,
      providesTags: ["Accounts"],
    }),
    
    getAccountDetails: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'AccountDetails', id }],
    }),

    addAccount: builder.mutation({
      query: (data) => ({ url: "/", method: "POST", body: data }),
      invalidatesTags: ["Accounts"],
    }),

    updateAccount: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/${id}`, method: "PUT", body: data }),
      invalidatesTags: (result, error, { id }) => ["Accounts", { type: 'AccountDetails', id }],
    }),

    deleteAccount: builder.mutation({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: ["Accounts"],
    }),
  }),
});

export const {
  useGetAccountDetailsQuery,
  useGetAccountsQuery,
  useAddAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation 
} = accountApi;