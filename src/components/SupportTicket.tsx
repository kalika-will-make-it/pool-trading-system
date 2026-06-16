import React, { useState } from 'react';
import { SupportTicket, UserAccount } from '../types';
import { 
  LifeBuoy, 
  PlusCircle, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  X, 
  Send, 
  CornerDownRight, 
  AlertCircle, 
  Archive, 
  Search, 
  Tag, 
  User, 
  History, 
  Mail,
  Check
} from 'lucide-react';

interface SupportTicketProps {
  currentUser: UserAccount;
  tickets: SupportTicket[];
  onSubmitTicket: (category: SupportTicket['category'], subject: string, message: string) => Promise<void>;
  onCloseTicket: (ticketId: string) => Promise<void>;
  isAdmin?: boolean;
  onRespondToTicket?: (ticketId: string, response: string) => Promise<void>;
}

export const SupportTicketComponent: React.FC<SupportTicketProps> = ({
  currentUser,
  tickets,
  onSubmitTicket,
  onCloseTicket,
  isAdmin = false,
  onRespondToTicket
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('history');
  const [category, setCategory] = useState<SupportTicket['category']>('other');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Expanded ticket ID tracker for user history
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);

  // Admin section States
  const [adminFilter, setAdminFilter] = useState<'all' | 'pending' | 'replied' | 'closed'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [adminReplyText, setAdminReplyText] = useState<{ [key: string]: string }>({});
  const [adminReplyingId, setAdminReplyingId] = useState<string | null>(null);
  const [adminActionLoading, setAdminActionLoading] = useState(false);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setErrorMsg('Please specify a subject for your issue.');
      return;
    }
    if (!message.trim() || message.trim().length < 5) {
      setErrorMsg('Description must be at least 5 characters long.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onSubmitTicket(category, subject, message);
      setSuccessMsg('Your support ticket has been registered. Our financial desk will review it shortly.');
      setSubject('');
      setMessage('');
      setCategory('other');
      setTimeout(() => {
        setSuccessMsg(null);
        setActiveTab('history');
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit ticket. Please check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    if (!window.confirm?.('Are you sure you want to mark this support ticket as resolved and close it?')) {
      // safe fallback if window.confirm is restricted in iframe
    }
    try {
      await onCloseTicket(ticketId);
    } catch (err: any) {
      alert(err?.message || 'Error closing ticket');
    }
  };

  const handleAdminResponse = async (ticketId: string) => {
    const text = adminReplyText[ticketId];
    if (!text || !text.trim()) {
      alert('Please specify a valid response message.');
      return;
    }

    setAdminActionLoading(true);
    try {
      if (onRespondToTicket) {
        await onRespondToTicket(ticketId, text);
        setAdminReplyText(prev => ({ ...prev, [ticketId]: '' }));
        setAdminReplyingId(null);
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to dispatch reply.');
    } finally {
      setAdminActionLoading(false);
    }
  };

  // Categories helper styling
  const getCategoryTheme = (cat: SupportTicket['category']) => {
    switch (cat) {
      case 'deposit':
        return { label: 'Deposit Help', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'withdrawal':
        return { label: 'Withdrawal Payout', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
      case 'investment':
        return { label: 'Pool Operations', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'account':
        return { label: 'Account Profile', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
      default:
        return { label: 'General / Other', bg: 'bg-slate-500/10 text-slate-400 border-slate-505/20' };
    }
  };

  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 text-2xs font-extrabold text-amber-400 uppercase tracking-wider font-mono">
            <Clock size={11} />
            Awaiting Admin
          </span>
        );
      case 'replied':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 px-2.5 py-0.5 text-2xs font-extrabold text-blue-400 uppercase tracking-wider font-mono">
            <CornerDownRight size={11} />
            Replied
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-2xs font-extrabold text-slate-400 uppercase tracking-wider font-mono">
            <Archive size={11} />
            Resolved
          </span>
        );
    }
  };

  // Filter & Search Tickets for ADMIN
  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = 
      adminFilter === 'all' || 
      (adminFilter === 'pending' && ticket.status === 'pending') ||
      (adminFilter === 'replied' && ticket.status === 'replied') ||
      (adminFilter === 'closed' && ticket.status === 'closed');

    const matchesSearch = 
      searchQuery.trim() === '' ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* HEADER HERO AREA */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-600/10 text-blue-400 rounded-xl">
              <LifeBuoy size={26} className="text-blue-400 stroke-[2]" />
            </div>
            <div>
              <h2 className="font-display text-base font-black text-white">
                {isAdmin ? 'Operational Support Desks' : 'Investor Help & Support System'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl font-sans">
                {isAdmin 
                  ? 'Respond to client dispute records, explain mobile payment transaction questions, and maintain ticket resolution metrics.'
                  : 'Submit questions regarding manual deposits, delay clearing of yield investments, or general account inquiries directly to administrators.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {isAdmin ? (
        /* ============================== ADMINISTRATOR LAYOUT ============================== */
        <div className="space-y-6">
          {/* SEARCH & FILTER CONTROLS */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-slate-950 border border-slate-855 p-4 rounded-xl">
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5 flex-1">
              {(['pending', 'replied', 'closed', 'all'] as const).map((filter) => {
                const count = tickets.filter(t => t.status === filter).length;
                const totalText = filter === 'all' ? `All (${tickets.length})` : 
                                  filter === 'pending' ? `Pending (${count})` : 
                                  filter === 'replied' ? `Replied (${count})` : `Resolved (${count})`;
                return (
                  <button
                    key={filter}
                    onClick={() => setAdminFilter(filter)}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider font-mono cursor-pointer transition ${
                      adminFilter === filter 
                        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30' 
                        : 'text-slate-500 hover:text-slate-300 bg-slate-900/30 hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    {totalText}
                  </button>
                );
              })}
            </div>

            {/* Simple Search Input */}
            <div className="relative min-w-[260px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search ticket content or user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/40"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* TICKETS LIST */}
          {filteredTickets.length === 0 ? (
            <div className="py-16 text-center text-slate-500 bg-slate-950 border border-slate-850 rounded-2xl">
              <CheckCircle2 className="mx-auto h-12 w-12 text-slate-800 stroke-[1.5]" />
              <p className="text-xs font-semibold mt-3 text-slate-400">No support tickets found</p>
              <p className="text-[10px] text-slate-600 mt-0.5">There are no threads meeting this specific query.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredTickets.map((ticket) => {
                const catTheme = getCategoryTheme(ticket.category);
                const isReplying = adminReplyingId === ticket.id;

                return (
                  <div 
                    key={ticket.id} 
                    className={`rounded-xl border transition p-5 ${
                      ticket.status === 'pending' 
                        ? 'bg-amber-950/5 border-amber-500/10 hover:border-amber-500/20 shadow-[0_1px_12px_rgba(245,158,11,0.02)]' 
                        : 'bg-slate-950 border-slate-850 hover:border-slate-800'
                    }`}
                  >
                    {/* Top Row: Meta and User info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(ticket.status)}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-semibold border ${catTheme.bg}`}>
                          <Tag size={10} />
                          {catTheme.label}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ID: {ticket.id.slice(0, 10).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(ticket.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {/* Mid Section: User Details */}
                    <div className="grid sm:grid-cols-2 gap-2 bg-slate-900/40 p-2.5 rounded-lg border border-slate-950/20 text-2xs text-slate-400 mt-3 font-sans">
                      <div className="flex items-center gap-1.5">
                        <User size={12} className="text-slate-500" />
                        <span className="text-slate-500">Sender Name:</span> 
                        <strong className="text-slate-300">{ticket.username}</strong>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail size={12} className="text-slate-500" />
                        <span className="text-slate-500">Contact Email:</span> 
                        <strong className="text-slate-300 font-mono">{ticket.userEmail}</strong>
                      </div>
                    </div>

                    {/* Third Row: Subject & Message Body */}
                    <div className="space-y-1.5 mt-4">
                      <h4 className="font-sans font-bold text-sm text-slate-205">
                        {ticket.subject}
                      </h4>
                      <p className="text-xs text-slate-350 leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-900/40 whitespace-pre-wrap">
                        {ticket.message}
                      </p>
                    </div>

                    {/* Admin Response section */}
                    {ticket.status !== 'pending' && (
                      <div className="mt-5 border-l-2 border-slate-700 bg-slate-900/10 p-4 rounded-r-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <CornerDownRight size={12} />
                            Administrative Response
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono">
                            Replied At: {new Date(ticket.respondedAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-blue-300/90 leading-relaxed font-sans whitespace-pre-wrap bg-slate-950/30 p-2.5 rounded border border-slate-900/20">
                          {ticket.adminResponse}
                        </p>
                      </div>
                    )}

                    {/* Action Panel */}
                    <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-900/50 pt-3">
                      {ticket.status === 'pending' && !isReplying && (
                        <button
                          onClick={() => setAdminReplyingId(ticket.id)}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg hover:shadow-blue-500/10 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send size={12} />
                          Formulate Response
                        </button>
                      )}

                      {ticket.status === 'replied' && !isReplying && (
                        <button
                          onClick={() => {
                            setAdminReplyingId(ticket.id);
                            setAdminReplyText(prev => ({ ...prev, [ticket.id]: ticket.adminResponse }));
                          }}
                          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          Update Response
                        </button>
                      )}

                      {ticket.status === 'pending' && (
                        <button
                          onClick={async () => {
                            if (window.confirm?.('Directly close and resolve this ticket without a response?')) {
                              setAdminActionLoading(true);
                              try {
                                if (onRespondToTicket) {
                                  await onRespondToTicket(ticket.id, 'Ticket resolved by administrator.');
                                }
                              } finally {
                                setAdminActionLoading(false);
                              }
                            }
                          }}
                          className="px-3 py-1.5 hover:bg-slate-900 text-slate-450 hover:text-slate-300 text-xs font-medium rounded-lg transition cursor-pointer"
                        >
                          Resolve Directly
                        </button>
                      )}
                    </div>

                    {/* Live Editor Block */}
                    {isReplying && (
                      <div className="mt-5 border-t border-slate-900/80 pt-4 space-y-3 p-1 animate-fade-in">
                        <label className="block text-2xs font-extrabold uppercase tracking-wide text-slate-400">
                          Response Draft Details
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Provide detailed assistance or confirm payment clearance details here..."
                          value={adminReplyText[ticket.id] || ''}
                          onChange={(e) => setAdminReplyText(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                          className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20"
                        />
                        <div className="flex items-center justify-end gap-2 text-xs">
                          <button
                            onClick={() => {
                              setAdminReplyingId(null);
                              setAdminReplyText(prev => ({ ...prev, [ticket.id]: '' }));
                            }}
                            className="bg-transparent hover:bg-slate-900 text-slate-400 px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer border border-transparent"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleAdminResponse(ticket.id)}
                            disabled={adminActionLoading || !adminReplyText[ticket.id]?.trim()}
                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg font-semibold shadow-lg hover:shadow-blue-500/15 transition flex items-center gap-1.5 cursor-pointer"
                          >
                            {adminActionLoading ? 'Dispatching...' : 'Send Response'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ============================== INVESTOR / USER LAYOUT ============================== */
        <div className="grid gap-6 md:grid-cols-12 items-start">
          
          {/* LEFT COLUMN: NAVIGATION / ACTION / NEW TICKET FORMS */}
          <div className="space-y-4 md:col-span-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs flex flex-col gap-1">
              <button
                onClick={() => {
                  setActiveTab('history');
                  setErrorMsg(null);
                }}
                className={`w-full rounded-lg py-2.5 px-4 cursor-pointer font-semibold transition flex items-center gap-2.5 ${
                  activeTab === 'history' ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20 font-bold' : 'text-slate-400 hover:text-white border border-transparent hover:bg-slate-900/30'
                }`}
              >
                <History size={15} />
                Your Support Tickets ({tickets.length})
              </button>
              
              <button
                onClick={() => {
                  setActiveTab('create');
                  setErrorMsg(null);
                }}
                className={`w-full rounded-lg py-2.5 px-4 cursor-pointer font-semibold transition flex items-center gap-2.5 ${
                  activeTab === 'create' ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20 font-bold' : 'text-slate-400 hover:text-white border border-transparent hover:bg-slate-900/30'
                }`}
              >
                <PlusCircle size={15} />
                Open A New Ticket
              </button>
            </div>

            <div className="rounded-xl border border-slate-850 p-4 bg-slate-900/10 text-2xs leading-relaxed text-slate-500 space-y-1.5">
              <strong className="text-slate-400 uppercase tracking-widest block font-sans text-[9px] mb-1">Clearance Desk Hours</strong>
              <p>Manual payouts, deposit receipts clearance, and customer questions are processed 24/7 matching prime Forex/Crypto business hours.</p>
              <p>Critical payments or account locking issues are reviewed in priority queues.</p>
            </div>
          </div>

          {/* RIGHT COLUMN: ACTIVE TAB AREA */}
          <div className="md:col-span-8">
            
            {activeTab === 'create' ? (
              /* CREATE TICKET FORM */
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 sm:p-6 space-y-5 shadow-2xl">
                <div className="border-b border-slate-900 pb-3 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                    <PlusCircle size={16} />
                  </div>
                  <div>
                    <h3 className="font-display font-medium text-sm text-white">Open Helpdesk Ticket</h3>
                    <p className="text-[10px] text-slate-500">Provide complete payment codes or questions to accelerate processing.</p>
                  </div>
                </div>

                {successMsg && (
                  <div className="rounded-xl bg-blue-950/20 border border-blue-500/30 p-4 text-xs font-semibold text-blue-400 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-blue-400 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="rounded-xl bg-rose-950/20 border border-rose-500/30 p-4 text-xs font-semibold text-rose-450 flex items-center gap-2">
                    <AlertCircle size={16} className="text-rose-400 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleCreateTicket} className="space-y-4">
                  
                  {/* Category select option */}
                  <div className="space-y-1.5">
                    <label className="block text-2xs font-extrabold uppercase tracking-widest text-slate-400">
                      Issue Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as SupportTicket['category'])}
                      className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500/40"
                    >
                      <option value="other">General Inquiries / Assistance</option>
                      <option value="deposit">Deposit Clearing Reference Delay</option>
                      <option value="withdrawal">Withdrawal / Payout Request Status</option>
                      <option value="investment">Active Trading Pool Issue</option>
                      <option value="account">Account Configuration / Mobile Number</option>
                    </select>
                  </div>

                  {/* Subject input field */}
                  <div className="space-y-1.5">
                    <label className="block text-2xs font-extrabold uppercase tracking-widest text-slate-400">
                      Brief Subject
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      placeholder="e.g., Deposit of $100 not credited yet with reference code..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/40"
                    />
                  </div>

                  {/* Message body text area */}
                  <div className="space-y-1.5">
                    <label className="block text-2xs font-extrabold uppercase tracking-widest text-slate-400">
                      Describe your problem in detail
                    </label>
                    <textarea
                      rows={5}
                      maxLength={1500}
                      placeholder="Be specific! Mention the amount, transaction phone number, reference codes, date, and any specific error code you encountered..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-205 placeholder-slate-600 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl py-2.5 cursor-pointer font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition flex items-center justify-center gap-1.5 hover:shadow-lg hover:shadow-blue-500/10"
                  >
                    {isSubmitting ? 'Transmitting code...' : 'Submit Support Ticket'}
                    <Send size={13} />
                  </button>

                </form>
              </div>
            ) : (
              /* HISTORY LIST FOR USERS */
              <div className="space-y-4">
                
                <div className="border-b border-slate-900 pb-2 flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                    <MessageSquare size={16} className="text-blue-400" />
                    Customer Support Thread Record
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">{tickets.length} Registered Threads</span>
                </div>

                {tickets.length === 0 ? (
                  <div className="py-12 bg-slate-950 border border-slate-850 rounded-2xl text-center text-slate-500">
                    <MessageSquare className="mx-auto h-12 w-12 text-slate-800 stroke-[1.5]" />
                    <p className="text-xs font-semibold mt-2.5">No Support Threads Registered</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">Need help clearing manual deposits? Open a support ticket.</p>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="mt-4 inline-flex items-center gap-1 bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs px-3.5 py-1.5 rounded-lg font-semibold hover:bg-blue-600/15 cursor-pointer transition"
                    >
                      <PlusCircle size={13} />
                      Request Support Assistance
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tickets.map((ticket) => {
                      const isExpanded = expandedTicketId === ticket.id;
                      const catTheme = getCategoryTheme(ticket.category);

                      return (
                        <div 
                          key={ticket.id} 
                          className={`rounded-xl border transition ${
                            isExpanded ? 'bg-slate-950 border-slate-750' : 'bg-slate-950/60 border-slate-850 hover:border-slate-800'
                          }`}
                        >
                          {/* Ticket Summary Row */}
                          <div 
                            onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)}
                            className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                          >
                            <div className="space-y-1.5 min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                {getStatusBadge(ticket.status)}
                                <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[9px] font-bold border ${catTheme.bg}`}>
                                  {catTheme.label}
                                </span>
                              </div>
                              <h4 className="font-sans font-bold text-xs text-white truncate pr-2">
                                {ticket.subject}
                              </h4>
                              <p className="text-[10px] font-mono text-slate-550">
                                Submitted {new Date(ticket.createdAt).toLocaleDateString()} at {new Date(ticket.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            </div>

                            <button className="text-slate-500 hover:text-slate-300 shrink-0">
                              {isExpanded ? (
                                <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Collapse</span>
                              ) : (
                                <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-blue-450">Expand</span>
                              )}
                            </button>
                          </div>

                          {/* Expanded content details */}
                          {isExpanded && (
                            <div className="border-t border-slate-900 p-4 bg-slate-950/90 rounded-b-xl space-y-4 animate-fade-in text-xs">
                              {/* Ticket Issue body block */}
                              <div className="space-y-1">
                                <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase">Your Original Issue:</span>
                                <p className="text-slate-305 leading-relaxed bg-slate-900 border border-slate-850/60 p-3 rounded-lg whitespace-pre-wrap font-sans">
                                  {ticket.message}
                                </p>
                              </div>

                              {/* Admin Response section */}
                              {ticket.status !== 'pending' ? (
                                <div className="border-t border-slate-900 pt-4 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono font-black text-blue-400 block uppercase flex items-center gap-1">
                                      <CornerDownRight size={12} />
                                      Response from Clearing Desk:
                                    </span>
                                    <span className="text-[9px] text-slate-500 font-mono">
                                      {new Date(ticket.respondedAt).toLocaleDateString()} at {new Date(ticket.respondedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                  </div>
                                  <p className="p-3 rounded-lg bg-blue-950/15 border border-blue-500/15 text-blue-300/90 font-sans leading-relaxed whitespace-pre-wrap font-medium">
                                    {ticket.adminResponse}
                                  </p>
                                </div>
                              ) : (
                                <div className="border-t border-slate-900 pt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                                  <Clock size={12} className="text-amber-500/70" />
                                  <span>Our administration is processing this instruction ticket details. Responses appear here.</span>
                                </div>
                              )}

                              {/* Resolutions actions */}
                              {ticket.status !== 'closed' && (
                                <div className="border-t border-slate-900/60 pt-3 flex items-center justify-end">
                                  <button
                                    onClick={() => handleCloseTicket(ticket.id)}
                                    className="px-3 py-1.5 text-2xs uppercase tracking-wider font-extrabold text-rose-450 hover:text-rose-400 hover:bg-rose-500/5 transition rounded-lg border border-rose-500/10 cursor-pointer"
                                  >
                                    Mark as Resolved & Close Thread
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
