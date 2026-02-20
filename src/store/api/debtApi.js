import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const debtApi = createApi({
  reducerPath: 'debtApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:3000/api/v1/dept', // Your provided route
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Debt', 'DebtSummary'],
  endpoints: (builder) => ({
    getDebts: builder.query({
      query: (userId) => `/user/${userId}`,
      providesTags: ['Debt'],
    }),
    getDebtSummary: builder.query({
      query: (userId) => `/user/${userId}/summary`,
      providesTags: ['DebtSummary'],
    }),
    createDebt: builder.mutation({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Debt', 'DebtSummary'],
    }),

    // Add to your existing debtApi.js
getDebtDetails: builder.query({
  query: (debtId) => `/${debtId}/details`, // Assuming this backend route exists
  providesTags: (result, error, id) => [{ type: 'Debt', id }],
}),
// Mutation to add a repayment
addRepayment: builder.mutation({
  query: ({ debtId, ...body }) => ({
    url: `/${debtId}/repayment`, 
    method: 'POST',
    body,
  }),
  invalidatesTags: (result, error, { debtId }) => [
    { type: 'Debt', id: debtId }, 
    'DebtSummary'
  ],
}),
  }),
});

export const { 
  useGetDebtsQuery, 
  useGetDebtSummaryQuery, 
  useCreateDebtMutation,
  useGetDebtDetailsQuery,
  useAddRepaymentMutation
} = debtApi;