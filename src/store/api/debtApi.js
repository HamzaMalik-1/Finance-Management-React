import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import appConfig from '../../config/appConfig';

export const debtApi = createApi({
  reducerPath: 'debtApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${appConfig.apiUrl}v1/debt`, // Your provided route
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

 getDebtDetails: builder.query({
  query: (id) => `/details/${id}`, // Matches /api/v1/dept/details/UUID
  providesTags: ['Debts'],
}),
addRepayment: builder.mutation({
  query: ({ id, ...body }) => ({
    url: `/repayment/${id}`, // Matches /api/v1/dept/repayment/UUID
    method: 'POST',
    body,
  }),
  invalidatesTags: ['Debts'],
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