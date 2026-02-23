import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import appConfig from "../../config/appConfig";

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${appConfig.apiUrl}v1`, // Update with your actual API URL
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Category"],
  endpoints: (builder) => ({
    // Fetch categories in tree structure
    getCategoryTree: builder.query({
      query: (userId) => `/category/tree/${userId}`,
      providesTags: ["Category"],
    }),

    // Create Category (Handles both parent and sub-categories)
    createCategory: builder.mutation({
      query: (body) => ({
        url: "/category",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Category"],
    }),

    // Delete Category
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/category/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: ["Category"],
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/category/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
  useGetCategoryTreeQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} = categoryApi;
