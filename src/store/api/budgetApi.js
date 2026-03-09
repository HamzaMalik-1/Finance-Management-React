import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const budgetApi = createApi({
  reducerPath: 'budgetApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000/api/v1/budget',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Budgets'],
  endpoints: (builder) => ({
    getBudgets: builder.query({
      query: (userId) => `/user/${userId}`,
      providesTags: ['Budgets'],
    }),
    createBudget: builder.mutation({
      query: (body) => ({ url: '/', method: 'POST', body }),
      invalidatesTags: ['Budgets'],
    }),
    updateBudget: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Budgets'],
    }),
    deleteBudget: builder.mutation({
      query: (id) => ({ url: `/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Budgets'],
    }),
  }),
});

export const { 
  useGetBudgetsQuery, 
  useCreateBudgetMutation, 
  useUpdateBudgetMutation, 
  useDeleteBudgetMutation 
} = budgetApi;