import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import appConfig from "../../config/appConfig";

export const transactionApi = createApi({
  reducerPath: "transactionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${appConfig.apiUrl}v1/transaction`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Transactions", "Accounts", "Budgets", "Debts"],
  endpoints: (builder) => ({
    getTransactions: builder.query({
      query: ({ userId, page = 1, limit = 10 }) => 
        `/transaction/${userId}?page=${page}&limit=${limit}`,
      providesTags: ["Transactions"],
    }),
    createTransaction: builder.mutation({
      query: (body) => ({ url: "/transaction", method: "POST", body }),
      // Important: Invalidate everything affected by a transaction
      invalidatesTags: ["Transactions", "Accounts", "Budgets", "Debts"],
    }),
    updateStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Transactions", "Accounts"],
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useCreateTransactionMutation,
  useUpdateStatusMutation,
} = transactionApi;