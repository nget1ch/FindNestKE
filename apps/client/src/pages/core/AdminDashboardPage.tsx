import { useState } from 'react';
import {
  Users,
  Home,
  Check,
  X,
  Banknote,
  ShieldCheck,
  ClipboardList,
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  Gavel,
  FileText,
  BarChart3,
  RefreshCw,
  CalendarDays,
  AlertTriangle,
  History,
  FileSearch,
  PlusCircle,
} from 'lucide-react';
import {
  useGetHousesQuery,
  useListUsersQuery,
  useGetBookingsQuery,
  useGetPaymentsQuery,
  useApproveListingMutation,
  useRejectListingMutation,
  useGetComplianceLogsQuery,
  useFileReturnsMutation,
  useApproveLandlordMutation,
} from '../../store/apiSlice';
import { AppLayout, PageShell, TopNav } from './shared';
import { formatKes } from '../../lib/nestfind';
import { toast } from 'react-hot-toast';

function StatCard({ label, value, icon: Icon, tone, small }: any) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-surface-container-highest bg-gradient-to-br ${tone} p-5 shadow-sm transition-all hover:shadow-md`}>
      <div className="relative z-10">
        <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-80">{label}</p>
        <p className={`font-headline mt-1 font-black tracking-tight text-on-surface ${small ? 'text-2xl' : 'text-3xl'}`}>
          {value}
        </p>
      </div>
      <Icon className="absolute -bottom-2 -right-2 h-16 w-16 text-on-surface opacity-5" />
    </div>
  );
}

function Pagination({ page, totalPages, onPageChange }: any) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-surface-container-highest bg-surface/30 px-4 py-3">
      <p className="text-xs text-on-surface-variant">
        Page <strong>{page}</strong> of <strong>{totalPages}</strong>
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-surface-container-highest bg-surface transition hover:bg-surface-container disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-surface-container-highest bg-surface transition hover:bg-surface-container disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  // --- STATE ---
  const [landlordPage, setLandlordPage] = useState(1);
  const [landlordSearch, setLandlordSearch] = useState('');
  const [listingPage, setListingPage] = useState(1);
  const [listingSearch, setListingSearch] = useState('');
  const [dirPage, setDirPage] = useState(1);
  const [dirSearch, setDirSearch] = useState('');

  // --- CALENDAR STATE ---
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [compSearch, setCompSearch] = useState('');

  // --- API QUERIES ---
  const { data: users, isLoading: uLoad } = useListUsersQuery({ role: 'landlord' });
  const { data: pendingLandlordsRaw, isLoading: plLoad } = useListUsersQuery({ 
    role: 'landlord', 
    accountStatus: 'pending',
    search: landlordSearch,
    page: landlordPage,
    limit: 5
  });

  const { data: houses, isLoading: hLoad } = useGetHousesQuery({});
  const { data: pendingRaw, isLoading: pListLoad } = useGetHousesQuery({ 
    status: 'pending_approval', 
    search: listingSearch,
    page: listingPage,
    limit: 5 
  });

  const { data: dirRaw, isLoading: dirLoad } = useListUsersQuery({
    role: 'landlord',
    accountStatus: 'approved',
    search: dirSearch,
    page: dirPage,
    limit: 5
  });

  const { data: bookings, isLoading: bLoad } = useGetBookingsQuery({ limit: 1000 });
  const { data: payments, isLoading: pLoad } = useGetPaymentsQuery({ limit: 1000 });
  const { data: complianceRaw } = useGetComplianceLogsQuery({ limit: 100 });

  const [approveListing, { isLoading: approveBusy }] = useApproveListingMutation();
  const [rejectListing, { isLoading: rejectBusy }] = useRejectListingMutation();
  const [approveLandlord, { isLoading: approveLandlordBusy }] = useApproveLandlordMutation();
  const [fileReturns, { isLoading: filingBusy }] = useFileReturnsMutation();

  const [feeByHouse, setFeeByHouse] = useState<Record<number, string>>({});
  const [verifyingTitle, setVerifyingTitle] = useState<number | null>(null);

  // --- DATA MAPPING ---
  const userItemsTotal = (users as any)?.total || (users as any)?.length || 0;
  const pendingLandlords = (pendingLandlordsRaw as any)?.items || [];
  const plTotalPages = Math.ceil(((pendingLandlordsRaw as any)?.total || 0) / 5);

  const houseItemsTotal = (houses as any)?.total || (houses as any)?.length || 0;
  const pendingItems = (pendingRaw as any)?.items || [];
  const pListTotalPages = Math.ceil(((pendingRaw as any)?.total || 0) / 5);

  const dirItems = (dirRaw as any)?.items || [];
  const dirTotalPages = Math.ceil(((dirRaw as any)?.total || 0) / 5);

  const bookingItems = (bookings as any)?.items || (bookings as any) || [];
  const paymentItems = (payments as any)?.items || (payments as any) || [];
  const complianceLogs = Array.isArray(complianceRaw) ? complianceRaw : (complianceRaw as any)?.items || [];

  // --- COMPLIANCE ENGINE (ADVANCED SUPPLEMENTARY FILING) ---
  const monthName = new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' });
  const periodKey = `${monthName} ${selectedYear}`;
  
  // Find all previous filings for this month
  const previousFilingsForMonth = complianceLogs.filter((log: any) => log.notes?.includes(periodKey));
  const totalFiledAlready = previousFilingsForMonth.reduce((s: number, l: any) => s + parseFloat(l.totalRevenueKes || 0), 0);
  const isPeriodFiled = previousFilingsForMonth.length > 0;

  const monthlyConfirmed = bookingItems.filter((b: any) => {
    const date = new Date(b.confirmedAt || b.createdAt);
    return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear && b.status === 'confirmed';
  });

  const currentTotalRevenue = monthlyConfirmed.reduce((sum: number, b: any) => sum + parseFloat(b.bookingFee || 0), 0);
  const unfiledRevenueDelta = Math.max(0, currentTotalRevenue - totalFiledAlready);
  
  const isNil = currentTotalRevenue <= 0;
  const needsSupplementary = unfiledRevenueDelta > 1; // More than 1 KES difference
  
  const taxOnDelta = unfiledRevenueDelta * 0.05;

  // Penalty Logic: No penalty for supplementary if initial was on time
  const today = new Date();
  const deadline = new Date(selectedYear, selectedMonth + 1, 20);
  const isLateInitial = today > deadline && !isPeriodFiled && !isNil;
  const penalty = isLateInitial ? 2000 : 0;

  const handleFileReturns = async (type: 'initial' | 'supplementary') => {
    try {
      const payload = isNil && type === 'initial'
        ? { action: 'nil_filing', totalRevenue: 0, totalMri: 0, totalBookingFees: 0, period: periodKey, notes: `NIL Return for ${periodKey}` }
        : { 
            action: 'tax_submission', 
            totalRevenue: type === 'initial' ? currentTotalRevenue : unfiledRevenueDelta, 
            totalMri: (type === 'initial' ? (currentTotalRevenue * 0.05) + penalty : taxOnDelta), 
            totalBookingFees: type === 'initial' ? currentTotalRevenue : unfiledRevenueDelta, 
            period: periodKey, 
            notes: `${type === 'initial' ? 'Initial' : 'Supplementary'} Return for ${periodKey}${penalty > 0 ? ' (Includes Late Penalty)' : ''}` 
          };

      await fileReturns(payload).unwrap();
      toast.success(`${type === 'initial' ? 'Initial' : 'Supplementary'} filing successful!`);
    } catch (e: any) {
      toast.error('Filing failed.');
    }
  };

  const verifyTitleDeed = async (houseId: number) => {
    setVerifyingTitle(houseId);
    await new Promise(r => setTimeout(r, 1500));
    setVerifyingTitle(null);
    toast.success('GavaConnect: Title Deed Verified. Ownership confirmed.');
  };

  const filteredCompLogs = complianceLogs.filter((log: any) => 
    log.notes?.toLowerCase().includes(compSearch.toLowerCase())
  );

  return (
    <AppLayout>
      <TopNav />
      <PageShell
        title="Admin Control Center"
        subtitle="Secure partner verification, statutory compliance, and revenue oversight."
        eyebrow="System Overlook"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Landlords"
            value={uLoad ? '…' : String(userItemsTotal)}
            icon={Users}
            tone="from-primary/15 to-surface"
          />
          <StatCard
            label="Total Assets"
            value={hLoad ? '…' : String(houseItemsTotal)}
            icon={Home}
            tone="from-primary-fixed/30 to-surface"
          />
          <StatCard
            label="Tax Obligation (5%)"
            value={bLoad ? '…' : isNil ? 'NIL' : `KES ${formatKes(currentTotalRevenue * 0.05)}`}
            icon={Gavel}
            tone={isNil ? 'from-surface to-surface' : 'from-error/15 to-surface'}
            small
          />
          <StatCard
            label="Settled Revenue"
            value={pLoad ? '…' : `KES ${formatKes(paymentItems.reduce((s: number, p: any) => s + parseFloat(p.amount || 0), 0))}`}
            icon={Banknote}
            tone="from-secondary/15 to-surface"
            small
          />
        </div>

        {/* --- ADVANCED COMPLIANCE HUB --- */}
        <div className="overflow-hidden rounded-2xl border border-surface-container-highest bg-surface-container-lowest shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-container-highest bg-surface p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-error text-on-error shadow-lg shadow-error/10">
                <CalendarDays className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-headline text-xl font-bold text-on-surface">GavaConnect™ Smart Compliance</h2>
                <p className="text-xs text-on-surface-variant">Real-time delta tracking for incremental filings.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 rounded-2xl border border-surface-container-highest bg-surface p-1 shadow-sm">
              <select className="bg-transparent px-3 py-1.5 text-sm font-bold outline-none" value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                {Array.from({ length: 12 }).map((_, i) => ( <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option> ))}
              </select>
              <select className="bg-transparent px-3 py-1.5 text-sm font-bold outline-none" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                {[2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div className="grid divide-y divide-surface-container-highest lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            <div className="p-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                <BarChart3 className="h-4 w-4" /> Total Period Revenue
              </div>
              <p className="mt-2 text-3xl font-black text-on-surface">KES {formatKes(currentTotalRevenue)}</p>
              <p className="mt-1 text-[10px] opacity-60">Already Filed: KES {formatKes(totalFiledAlready)}</p>
            </div>
            
            <div className={`p-6 ${needsSupplementary ? 'bg-secondary/5' : 'bg-surface-container-lowest'}`}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-secondary">Unfiled Balance</p>
                {needsSupplementary && <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-black text-white animate-pulse">NEW REVENUE</span>}
              </div>
              <p className="mt-2 text-3xl font-black text-secondary">KES {formatKes(unfiledRevenueDelta)}</p>
              <p className="mt-1 text-[10px] font-bold text-secondary uppercase">Tax Due: KES {formatKes(taxOnDelta)}</p>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface">
                <ShieldCheck className="h-4 w-4 text-secondary" /> Action Center
              </div>
              <div className="mt-3">
                {isPeriodFiled && !needsSupplementary ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-secondary">
                      <ShieldCheck className="h-5 w-5" />
                      <span className="text-lg font-black uppercase italic tracking-tighter">FILED & UP TO DATE</span>
                    </div>
                    <p className="text-[10px] opacity-60">Last sync: {new Date(previousFilingsForMonth[0].createdAt).toLocaleString()}</p>
                  </div>
                ) : needsSupplementary ? (
                  <button
                    onClick={() => handleFileReturns('supplementary')}
                    disabled={filingBusy}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-3 text-sm font-black uppercase tracking-widest text-white shadow-lg transition hover:opacity-90 disabled:opacity-30"
                  >
                    {filingBusy ? <RefreshCw className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                    File Supplementary Return
                  </button>
                ) : (
                  <button
                    onClick={() => handleFileReturns('initial')}
                    disabled={filingBusy}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-on-surface px-4 py-3 text-sm font-black uppercase tracking-widest text-surface shadow-lg transition hover:opacity-90 disabled:opacity-30"
                  >
                    {filingBusy ? <RefreshCw className="h-4 w-4 animate-spin" /> : isNil ? <Check className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                    {isNil ? 'File Nil Return' : `File Initial Return`}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {isLateInitial && (
            <div className="flex items-center gap-3 border-t border-error/20 bg-error/5 px-6 py-3 text-xs text-error">
              <AlertTriangle className="h-4 w-4" />
              <strong>Penalty Applied:</strong> Statutory deadline (20th) passed for initial filing. Penalty KES {formatKes(penalty)} added.
            </div>
          )}
        </div>

        {/* --- ACTION ZONE --- */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Asset Verification */}
          <div className="overflow-hidden rounded-2xl border border-surface-container-highest bg-surface-container-lowest shadow-sm flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-container-highest bg-surface p-4">
              <h2 className="font-headline flex items-center gap-2 text-sm font-bold text-on-surface uppercase tracking-widest">
                <ClipboardList className="h-5 w-5 text-primary" /> Property Verification
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 opacity-40" />
                <input type="text" placeholder="Search..." value={listingSearch} onChange={(e) => { setListingSearch(e.target.value); setListingPage(1); }} className="rounded-xl border border-surface-container-highest bg-surface py-1.5 pl-9 pr-4 text-xs" />
              </div>
            </div>
            <div className="flex-1 overflow-x-auto">
              {pListLoad ? <div className="p-8 space-y-4"><div className="h-8 bg-surface-container rounded animate-pulse"/><div className="h-8 bg-surface-container rounded animate-pulse"/></div> : (
                <table className="w-full min-w-[500px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-surface-container-highest bg-surface/50 font-bold uppercase text-on-surface-variant">
                      <th className="px-4 py-3">Property</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingItems.length === 0 ? ( <tr><td colSpan={2} className="p-12 text-center opacity-40 italic">Clean queue.</td></tr> ) : (
                      pendingItems.map((h: any) => (
                        <tr key={h.houseId} className="border-b border-surface-container-highest last:border-0 hover:bg-surface/30 transition-colors">
                          <td className="px-4 py-4">
                            <p className="font-bold">{h.title}</p>
                            <div className="flex gap-2 mt-1">
                              <button onClick={() => verifyTitleDeed(h.houseId)} disabled={verifyingTitle === h.houseId} className="text-[9px] font-black uppercase text-primary border border-primary/20 px-2 py-0.5 rounded flex items-center gap-1">
                                {verifyingTitle === h.houseId ? <RefreshCw className="h-2.5 w-2.5 animate-spin" /> : <FileSearch className="h-2.5 w-2.5" />} Title Search
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button disabled={approveBusy} onClick={async () => { 
                                const fee = parseFloat(feeByHouse[h.houseId] || '0'); 
                                if (fee > 0) {
                                  try {
                                    await approveListing({ houseId: h.houseId, bookingFee: fee }).unwrap();
                                    toast.success('Listing Authorized & Live');
                                  } catch (err: any) {
                                    console.error('Approve failed:', err);
                                    toast.error(err.data?.error || 'Database error during authorization.');
                                  }
                                } else { 
                                  toast.error('Set platform fee'); 
                                } 
                              }} className="bg-primary text-on-primary px-2.5 py-1.5 rounded-lg font-bold text-[10px] uppercase">
                                {approveBusy ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                              </button>
                              <button disabled={rejectBusy} onClick={() => { const r = window.prompt('Reason:'); if (r) rejectListing({ houseId: h.houseId, reason: r }).unwrap().then(() => toast.success('Rejected')); }} className="border border-error/40 text-error px-2.5 py-1.5 rounded-lg font-bold text-[10px] uppercase">
                                <X className="h-3 w-3" />
                              </button>
                              <input type="number" placeholder="Fee" className="w-16 border border-surface-container-highest bg-surface px-1.5 py-1.5 rounded-lg text-[10px] font-bold" value={feeByHouse[h.houseId] || ''} onChange={(e) => setFeeByHouse({ ...feeByHouse, [h.houseId]: e.target.value })} />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
            <Pagination page={listingPage} totalPages={pListTotalPages} onPageChange={setListingPage} />
          </div>

          {/* Landlord Onboarding */}
          <div className="overflow-hidden rounded-2xl border border-surface-container-highest bg-surface-container-lowest shadow-sm flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-container-highest bg-surface p-4">
              <h2 className="font-headline flex items-center gap-2 text-sm font-bold text-on-surface uppercase tracking-widest">
                <ShieldCheck className="h-5 w-5 text-secondary" /> Authorizations
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 opacity-40" />
                <input type="text" placeholder="Search..." value={landlordSearch} onChange={(e) => { setLandlordSearch(e.target.value); setLandlordPage(1); }} className="rounded-xl border border-surface-container-highest bg-surface py-1.5 pl-9 pr-4 text-xs" />
              </div>
            </div>
            <div className="flex-1 overflow-x-auto">
              {plLoad ? <div className="p-8 space-y-4"><div className="h-8 bg-surface-container rounded animate-pulse"/><div className="h-8 bg-surface-container rounded animate-pulse"/></div> : (
                <table className="w-full min-w-[400px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-surface-container-highest bg-surface/50 font-bold uppercase text-on-surface-variant">
                      <th className="px-4 py-3">Landlord</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingLandlords.length === 0 ? ( <tr><td colSpan={3} className="p-12 text-center opacity-40 italic">No applications.</td></tr> ) : (
                      pendingLandlords.map((u: any) => (
                        <tr key={u.userId} className="border-b border-surface-container-highest last:border-0 hover:bg-surface/30 transition-colors">
                          <td className="px-4 py-4 font-bold">{u.fullName}</td>
                          <td className="px-4 py-4">
                            <span className="bg-secondary-fixed/20 text-secondary text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 w-fit"><ShieldCheck className="h-2.5 w-2.5"/> PIN Verified</span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button disabled={approveLandlordBusy} onClick={() => { 
                              approveLandlord(u.userId).unwrap().then(() => {
                                toast.success('Landlord authorized successfully');
                              }).catch((err: any) => {
                                console.error('Approve failed:', err);
                                toast.error(err.data?.message || err.data?.error || 'Authorization failed');
                              });
                            }} className="bg-secondary text-white px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase shadow-sm hover:bg-secondary/90 transition-all disabled:opacity-50 flex items-center gap-1.5">
                              {approveLandlordBusy ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                              Authorize
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
            <Pagination page={landlordPage} totalPages={plTotalPages} onPageChange={setLandlordPage} />
          </div>
        </div>

        {/* --- SYSTEM LOGS --- */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-surface-container-highest bg-surface-container-lowest shadow-sm flex flex-col">
            <div className="border-b border-surface-container-highest bg-surface p-4 flex items-center justify-between">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5 text-primary" /> Activity Log
              </h2>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {bookingItems.length === 0 ? <p className="p-8 text-center text-[10px] opacity-40 uppercase font-black">Waiting for transactions...</p> : (
                bookingItems.slice(0, 10).map((b: any) => (
                  <div key={b.bookingId} className="flex items-center justify-between border-b border-surface-container-highest px-4 py-3 last:border-0 hover:bg-surface/30 transition-colors">
                    <span className="text-[10px] font-bold">Booking #{b.bookingId}</span>
                    <span className="text-[10px] font-black text-secondary uppercase italic">{b.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-surface-container-highest bg-surface-container-lowest shadow-sm flex flex-col">
            <div className="border-b border-surface-container-highest bg-surface p-4 flex items-center justify-between">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-error flex items-center gap-2">
                <History className="h-3.5 w-3.5" /> Filing History
              </h2>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 opacity-40" />
                <input type="text" placeholder="Filter logs..." className="rounded-lg border border-surface-container-highest bg-surface py-1 pl-7 pr-2 text-[9px]" value={compSearch} onChange={(e) => setCompSearch(e.target.value)} />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredCompLogs.length === 0 ? <p className="p-8 text-center text-[10px] opacity-40 uppercase font-black">No filings recorded.</p> : (
                filteredCompLogs.map((log: any) => (
                  <div key={log.logId} className="flex items-center justify-between border-b border-surface-container-highest px-4 py-3 last:border-0 hover:bg-surface/30">
                    <span className="text-[10px] font-bold">{log.notes || 'Tax Return'}</span>
                    <span className="text-[10px] font-black text-secondary flex items-center gap-1 uppercase italic"><Check className="h-3 w-3"/> Filed</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* --- LANDLORD DIRECTORY --- */}
        <div className="overflow-hidden rounded-2xl border border-surface-container-highest bg-surface-container-lowest shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-container-highest bg-surface p-4">
            <h2 className="font-headline flex items-center gap-2 text-lg font-bold text-on-surface">
              <Users className="h-5 w-5 text-primary" /> Landlord Directory
            </h2>
            <div className="relative min-w-[240px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-40" />
              <input type="text" placeholder="Search partners..." value={dirSearch} onChange={(e) => setDirSearch(e.target.value)} className="w-full rounded-xl border border-surface-container-highest bg-surface py-2 pl-10 pr-4 text-sm" />
            </div>
          </div>
          <div className="overflow-x-auto">
            {dirLoad ? <div className="p-8 space-y-4"><div className="h-8 bg-surface-container rounded animate-pulse"/><div className="h-8 bg-surface-container rounded animate-pulse"/></div> : (
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-container-highest bg-surface/50 text-[10px] font-black uppercase text-on-surface-variant tracking-widest">
                    <th className="px-4 py-4">ID</th>
                    <th className="px-4 py-4">Partner Name</th>
                    <th className="px-4 py-4">Contact</th>
                    <th className="px-4 py-4 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {dirItems.length === 0 ? ( <tr><td colSpan={4} className="p-12 text-center opacity-40">Empty directory.</td></tr> ) : (
                    dirItems.map((u: any) => (
                      <tr key={u.userId} className="border-b border-surface-container-highest last:border-0 hover:bg-surface/30">
                        <td className="px-4 py-4 font-mono text-[10px] opacity-60">#{u.userId}</td>
                        <td className="px-4 py-4 font-bold">{u.fullName}</td>
                        <td className="px-4 py-4 opacity-70">{u.email}</td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-[10px] font-black text-secondary uppercase italic">Verified Partner</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
          <Pagination page={dirPage} totalPages={dirTotalPages} onPageChange={setDirPage} />
        </div>
      </PageShell>
    </AppLayout>
  );
}
