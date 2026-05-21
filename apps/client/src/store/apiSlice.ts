import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from './authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || '/api',
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
    registerLandlordWithDocs: builder.mutation({
      query: (data) => ({
        url: '/auth/register-landlord-with-docs',
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
    approveHouse: builder.mutation<any, number>({
      query: (houseId) => ({
        url: `/houses/${houseId}/approve`,
        method: 'PATCH',
        body: { bookingFee: 1000 },
      }),
      invalidatesTags: ['House'],
    }),
    rejectHouse: builder.mutation<any, { houseId: number; reason?: string }>({
      query: ({ houseId, reason }) => ({
        url: `/houses/${houseId}/reject`,
        method: 'PATCH',
        body: { reason: reason ?? 'No reason provided' },
      }),
      invalidatesTags: ['House'],
    }),
    revokeHouse: builder.mutation<any, { houseId: number; reason?: string }>({
      query: ({ houseId, reason }) => ({
        url: `/houses/${houseId}/revoke`,
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
    
    getNotifications: builder.query<any, any>({
      query: (params) => ({ url: '/notifications', params }),
    }),
    getOverviewStats: builder.query<any, any>({
      query: (params) => ({ url: '/analytics/overview-stats', params }),
    }),
    getAdminStats: builder.query<any, any>({
      query: (params) => ({ url: '/analytics/admin-stats', params }),
    }),
    listAuditLogs: builder.query<any, any>({
      query: (params) => ({ url: '/audit-logs', params }),
    }),
    getRevenue: builder.query<any, any>({
      query: (params) => ({ url: '/payments/revenue', params }),
    }),
    getMarketPulse: builder.query<any, any>({
      query: (params) => ({ url: '/analytics/market-pulse', params }),
    }),
    getNeighborhoodTrends: builder.query<any, any>({
      query: (params) => ({ url: '/analytics/neighborhood-trends', params }),
    }),
    markNotificationRead: builder.mutation<any, number | string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'PATCH' }),
    }),
    markAllNotificationsRead: builder.mutation<any, void>({
      query: () => ({ url: '/notifications/read-all', method: 'POST' }),
    }),
    submitNilFiling: builder.mutation<any, any>({
      query: (data) => ({ url: '/compliance/file', method: 'POST', body: { ...data, action: 'nil_filing' } }),
    }),
    verifyCompliance: builder.mutation<any, any>({
      query: (data) => ({ url: '/compliance/verify-kra', method: 'POST', body: data }),
    }),
    verifyNationalId: builder.mutation<any, any>({
      query: (data) => ({ url: '/compliance/verify-id', method: 'POST', body: data }),
    }),
    createStripeIntent: builder.mutation<any, any>({
      query: (data) => ({ url: '/payments/card/initiate', method: 'POST', body: data }),
    }),
    resetSession: builder.mutation<any, any>({
      query: (data) => ({ url: '/chatbot/reset', method: 'POST', body: data }),
    }),
    approveLandlord: builder.mutation<any, number>({
      query: (userId) => ({ url: `/auth/landlords/${userId}/approve`, method: 'POST' }),
      invalidatesTags: ['User'],
    }),
    rejectLandlord: builder.mutation<any, { userId: number; reason?: string }>({
      query: ({ userId, reason }) => ({ url: `/auth/landlords/${userId}/reject`, method: 'POST', body: { reason } }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRegisterLandlordWithDocsMutation,
  useGetHousesQuery,
  useGetLocationsQuery,
  useGetHouseByIdQuery,
  useCreateHouseMutation,
  useApproveListingMutation,
  useRejectListingMutation,
  useApproveHouseMutation,
  useRejectHouseMutation,
  useRevokeHouseMutation,
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
  useGetNotificationsQuery,
  useGetOverviewStatsQuery,
  useGetAdminStatsQuery,
  useListAuditLogsQuery,
  useGetRevenueQuery,
  useGetMarketPulseQuery,
  useGetNeighborhoodTrendsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useSubmitNilFilingMutation,
  useVerifyComplianceMutation,
  useVerifyNationalIdMutation,
  useCreateStripeIntentMutation,
  useResetSessionMutation,
  useApproveLandlordMutation,
  useRejectLandlordMutation,
} = apiSlice;
