import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from './authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithAuthGuard = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error?.status === 401) {
    api.dispatch(logout());
    if (window.location.pathname !== '/login') {
      api.dispatch(logout());
      window.location.href = '/login';
    }
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuthGuard,
  tagTypes: ['House', 'Booking', 'User', 'Payment'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: '/users',
        method: 'POST',
        body: data,
      }),
    }),

    listUsers: builder.query<any, any>({
      query: (params) => ({ url: '/users', params }),
      providesTags: ['User'],
    }),
    updateUser: builder.mutation<any, { userId: number; data: any }>({
      query: ({ userId, data }) => ({ url: `/users/${userId}`, method: 'PUT', body: data }),
      invalidatesTags: ['User'],
    }),

    getHouses: builder.query({
      query: (params) => ({
        url: '/houses',
        params,
      }),
      providesTags: ['House'],
    }),
    getLocations: builder.query<any, any>({
      query: (params) => ({
        url: '/locations',
        params,
      }),
    }),
    getHouseById: builder.query({
      query: (id) => `/houses/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'House', id }],
    }),
    createHouse: builder.mutation({
      query: (body: FormData | Record<string, unknown>) => ({
        url: '/houses',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['House'],
    }),
    approveListing: builder.mutation<any, { houseId: number; bookingFee: number }>({
      query: ({ houseId, bookingFee }) => ({
        url: `/houses/${houseId}/approve`,
        method: 'PATCH',
        body: { bookingFee },
      }),
      invalidatesTags: ['House'],
    }),
    rejectListing: builder.mutation<any, { houseId: number; reason?: string }>({
      query: ({ houseId, reason }) => ({
        url: `/houses/${houseId}/reject`,
        method: 'PATCH',
        body: { reason: reason ?? 'No reason provided' },
      }),
      invalidatesTags: ['House'],
    }),
    updateHouse: builder.mutation<any, { id: number; data: any }>({
      query: ({ id, data }) => ({
        url: `/houses/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['House'],
    }),
    deleteHouse: builder.mutation<any, number>({
      query: (id) => ({
        url: `/houses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['House'],
    }),
    getBookings: builder.query<any, any>({
      query: (params) => ({ url: '/bookings', params }),
      providesTags: ['Booking'],
    }),
    createMpesaPush: builder.mutation({
      query: (data) => ({
        url: '/payments/mpesa/stkpush',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payment', 'Booking'],
    }),
    getPaymentStatus: builder.query({
      query: (bookingId: string | number) => ({
        url: '/payments/status',
        params: { bookingId },
      }),
      providesTags: (_result, _error, bookingId) => [{ type: 'Payment', id: String(bookingId) }],
    }),
    getPayments: builder.query<any, any>({
      query: (params) => ({ url: '/payments', params }),
      providesTags: ['Payment'],
    }),
    sendMessage: builder.mutation({
      query: (data) => ({
        url: '/chatbot/message',
        method: 'POST',
        body: data,
      }),
    }),
    getProfile: builder.query<any, void>({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),
    getComplianceLogs: builder.query<any, any>({
      query: (params) => ({ url: '/compliance/logs', params }),
      providesTags: ['Payment'], // Use Payment tag to refresh when payments happen
    }),
    fileReturns: builder.mutation<any, any>({
      query: (data) => ({ url: '/compliance/file', method: 'POST', body: data }),
      invalidatesTags: ['Payment'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetHousesQuery,
  useGetLocationsQuery,
  useGetHouseByIdQuery,
  useCreateHouseMutation,
  useApproveListingMutation,
  useRejectListingMutation,
  useUpdateHouseMutation,
  useDeleteHouseMutation,
  useGetBookingsQuery,
  useCreateMpesaPushMutation,
  useGetPaymentStatusQuery,
  useGetPaymentsQuery,
  useSendMessageMutation,
  useListUsersQuery,
  useUpdateUserMutation,
  useGetProfileQuery,
  useGetComplianceLogsQuery,
  useFileReturnsMutation,
} = apiSlice;
