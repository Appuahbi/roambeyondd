import { apiSlice } from '../api/apiSlice'

export const packagesService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPackages: builder.query({
      query: (params) => ({
        url: '/packages',
        params,
      }),
      providesTags: ['Package'],
    }),
    getPackageBySlug: builder.query({
      query: (slug) => `/packages/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Package', id: slug }],
    }),
  }),
})

export const { useGetPackagesQuery, useGetPackageBySlugQuery } = packagesService
