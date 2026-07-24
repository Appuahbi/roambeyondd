import { apiSlice } from '../api/apiSlice'

export const blogsService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBlogs: builder.query({
      query: (params) => ({
        url: '/blogs',
        params,
      }),
      providesTags: ['Blog'],
    }),
    getBlogBySlug: builder.query({
      query: (slug) => `/blogs/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Blog', id: slug }],
    }),
  }),
})

export const { useGetBlogsQuery, useGetBlogBySlugQuery } = blogsService
