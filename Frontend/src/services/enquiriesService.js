import { apiSlice } from '../api/apiSlice'

export const enquiriesService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createEnquiry: builder.mutation({
      query: (data) => ({
        url: '/enquiries',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Enquiry'],
    }),
    getMyEnquiries: builder.query({
      query: () => '/enquiries',
      providesTags: ['Enquiry'],
    }),
    getEnquiryById: builder.query({
      query: (id) => `/enquiries/${id}`,
      providesTags: (result, error, id) => [{ type: 'Enquiry', id }],
    }),
  }),
})

export const {
  useCreateEnquiryMutation,
  useGetMyEnquiriesQuery,
  useGetEnquiryByIdQuery,
} = enquiriesService
