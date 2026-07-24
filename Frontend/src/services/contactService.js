import { apiSlice } from '../api/apiSlice'

export const contactService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    submitContact: builder.mutation({
      query: (data) => ({
        url: '/contact',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Contact'],
    }),
  }),
})

export const { useSubmitContactMutation } = contactService
