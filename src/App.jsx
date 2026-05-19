import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Mock data generator
const generateMockWebhooks = () => {
  const recipients = [
    '+918888123456', '+918888234567', '+918888345678', '+918888456789',
    'borrower1@email.com', 'borrower2@email.com', 'user@example.com',
  ];
  const errorTypes = [null, null, null, 'TIMEOUT', 'RATE_LIMIT', 'AUTH_FAILURE', 'NETWORK_ERROR', 'INVALID_RECIPIENT'];
  const channels = ['whatsapp', 'sms', 'email'];
  
  const webhooks = [];
  for (let i = 1; i <= 150; i++) {
    const hasError = Math.random() > 0.7;
    const errorType = hasError ? errorTypes[Math.floor(Math.random() * errorTypes.length)] : null;
    const status = hasError ? 'failed' : (Math.random() > 0.95 ? 'pending' : 'sent');
    
    webhooks.push({
      id: `WH-${String(i).padStart(6, '0')}`,
      recipient: recipients[Math.floor(Math.random() * recipients.length)],
      channel: channels[Math.floor(Math.random() * channels.length)],
      status,
      errorType,
      errorMessage: errorType ? `Gateway error: ${errorType.toLowerCase()}` : '',
      sentAt: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      responseAt: new Date(Date.now() - Math.random() * 3000000).toISOString(),
      retryCount: hasError && Math.random() > 0.6 ? Math.floor(Math.random() * 3) : 0,
      loanId: `LOAN-${Math.floor(Math.random() * 10000)}`,
      amountDue: (Math.random() * 50000 + 5000).toFixed(0),
    });
  }
  return webhooks;
};

const WebhookDashboard = () => {
  const [webhooks, setWebhooks] = useState(() => generateMockWebhooks());
  const [filteredWebhooks, setFilteredWebhooks] = useState(webhooks);
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [errorFilter, setErrorFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryMessage, setRetryMessage] = useState('');

  // Filter logic
  useEffect(() => {
    let filtered = webhooks;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(w => w.status === statusFilter);
    }
    if (channelFilter !== 'all') {
      filtered = filtered.filter(w => w.channel === channelFilter);
    }
    if (errorFilter !== 'all') {
      filtered = filtered.filter(w => w.errorType === errorFilter);
    }
    if (searchTerm) {
      filtered = filtered.filter(w => 
        w.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredWebhooks(filtered);
  }, [webhooks, statusFilter, channelFilter, errorFilter, searchTerm]);

  // Metrics
  const totalSent = webhooks.length;
  const successCount = webhooks.filter(w => w.status === 'sent').length;
  const failedCount = webhooks.filter(w => w.status === 'failed').length;
  const pendingCount = webhooks.filter(w => w.status === 'pending').length;
  const successRate = ((successCount / totalSent) * 100).toFixed(1);

  // Error breakdown
  const errorBreakdown = {};
  webhooks.forEach(w => {
    if (w.errorType) {
      errorBreakdown[w.errorType] = (errorBreakdown[w.errorType] || 0) + 1;
    }
  });
  const errorData = Object.entries(errorBreakdown).map(([type, count]) => ({
    name: type,
    value: count,
    percentage: ((count / failedCount) * 100).toFixed(0)
  }));

  // Channel distribution
  const channelData = {};
  webhooks.forEach(w => {
    channelData[w.channel] = (channelData[w.channel] || 0) + 1;
  });
  const channelStats = Object.entries(channelData).map(([channel, count]) => ({
    name: channel.charAt(0).toUpperCase() + channel.slice(1),
    value: count,
    percentage: ((count / totalSent) * 100).toFixed(1)
  }));

  const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#06b6d4', '#0ea5e9', '#3b82f6'];

  // Retry handler
  const handleRetry = () => {
    setIsRetrying(true);
    setRetryMessage('');
    
    setTimeout(() => {
      const failedToRetry = filteredWebhooks.filter(w => w.status === 'failed');
      const successfulRetries = Math.floor(failedToRetry.length * 0.85);
      const stillFailing = failedToRetry.length - successfulRetries;

      setRetryMessage(`✓ ${successfulRetries} retried successfully, ${stillFailing} still failing`);
      
      setWebhooks(prev => 
        prev.map(w => {
          if (failedToRetry.find(f => f.id === w.id) && Math.random() < 0.85) {
            return { ...w, status: 'sent', retryCount: w.retryCount + 1, errorType: null };
          }
          return w;
        })
      );
      
      setIsRetrying(false);
    }, 2000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#fff',
      fontFamily: "'Segoe UI', 'Roboto', sans-serif",
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 700, margin: '0 0 0.5rem 0', letterSpacing: '-0.5px' }}>
          Webhook Orchestration Monitor
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#94a3b8', margin: 0 }}>
          Real-time payment reminder delivery analytics
        </p>
      </div>

      {/* Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2.5rem'
      }}>
        {[
          { label: 'Total Sent', value: totalSent, color: '#64748b' },
          { label: 'Success Rate', value: `${successRate}%`, color: '#10b981' },
          { label: 'Failed', value: failedCount, color: '#ef4444' },
          { label: 'Pending Retry', value: pendingCount, color: '#f59e0b' }
        ].map((metric, idx) => (
          <div
            key={idx}
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              borderRadius: '10px',
              padding: '1.25rem',
              backdropFilter: 'blur(10px)'
            }}
          >
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 0.5rem 0', fontWeight: 500 }}>
              {metric.label}
            </p>
            <p style={{
              fontSize: '2rem',
              fontWeight: 700,
              margin: 0,
              color: metric.color,
              letterSpacing: '-1px'
            }}>
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        {/* Error Distribution */}
        {errorData.length > 0 && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(148, 163, 184, 0.15)',
            borderRadius: '10px',
            padding: '1.5rem',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 1rem 0', color: '#e2e8f0' }}>
              Error Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={errorData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {errorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    borderRadius: '6px',
                    color: '#e2e8f0'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Channel Distribution */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(148, 163, 184, 0.15)',
          borderRadius: '10px',
          padding: '1.5rem',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 1rem 0', color: '#e2e8f0' }}>
            Channel Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={channelStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '6px',
                  color: '#e2e8f0'
                }}
              />
              <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(148, 163, 184, 0.15)',
        borderRadius: '10px',
        padding: '1.5rem',
        marginBottom: '2rem',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Search by phone, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '0.75rem 1rem',
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              borderRadius: '6px',
              color: '#e2e8f0',
              fontSize: '0.9rem',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = 'rgba(6, 182, 212, 0.5)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(148, 163, 184, 0.3)'}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          {[
            {
              label: 'Status',
              value: statusFilter,
              onChange: setStatusFilter,
              options: ['all', 'sent', 'failed', 'pending']
            },
            {
              label: 'Channel',
              value: channelFilter,
              onChange: setChannelFilter,
              options: ['all', 'whatsapp', 'sms', 'email']
            },
            {
              label: 'Error Type',
              value: errorFilter,
              onChange: setErrorFilter,
              options: ['all', ...Object.keys(errorBreakdown)]
            }
          ].map((filter) => (
            <div key={filter.label}>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                {filter.label}
              </label>
              <select
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '6px',
                  color: '#e2e8f0',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {filter.options.map(opt => (
                  <option key={opt} value={opt}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Retry Controls */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={handleRetry}
          disabled={isRetrying || failedCount === 0}
          style={{
            padding: '0.85rem 1.5rem',
            background: failedCount > 0 ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' : '#64748b',
            border: 'none',
            borderRadius: '6px',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: failedCount > 0 && !isRetrying ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            opacity: failedCount > 0 && !isRetrying ? 1 : 0.5,
            transform: isRetrying ? 'scale(0.98)' : 'scale(1)'
          }}
        >
          {isRetrying ? 'Retrying...' : `Retry Failed Webhooks (${failedCount})`}
        </button>
        {retryMessage && (
          <span style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: 500 }}>
            {retryMessage}
          </span>
        )}
      </div>

      {/* Webhook Table */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(148, 163, 184, 0.15)',
        borderRadius: '10px',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.85rem'
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.15)', background: 'rgba(30, 41, 59, 0.4)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>ID</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>Recipient</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>Channel</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>Error Type</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>Sent At</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>Retries</th>
              </tr>
            </thead>
            <tbody>
              {filteredWebhooks.slice(0, 15).map((webhook, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid rgba(148, 163, 184, 0.05)',
                    background: idx % 2 === 0 ? 'transparent' : 'rgba(30, 41, 59, 0.2)',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(30, 41, 59, 0.2)'}
                >
                  <td style={{ padding: '0.75rem 1rem', color: '#cbd5e1', fontFamily: 'monospace' }}>
                    {webhook.id}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#cbd5e1' }}>
                    {webhook.recipient.length > 20 ? webhook.recipient.substring(0, 20) + '...' : webhook.recipient}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{
                      padding: '0.3rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: webhook.channel === 'whatsapp' ? 'rgba(34, 197, 94, 0.2)' : 
                                 webhook.channel === 'sms' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                      color: webhook.channel === 'whatsapp' ? '#22c55e' : 
                             webhook.channel === 'sms' ? '#3b82f6' : '#a855f7'
                    }}>
                      {webhook.channel.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{
                      padding: '0.3rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: webhook.status === 'sent' ? 'rgba(16, 185, 129, 0.2)' : 
                                 webhook.status === 'failed' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: webhook.status === 'sent' ? '#10b981' : 
                             webhook.status === 'failed' ? '#ef4444' : '#f59e0b'
                    }}>
                      {webhook.status.charAt(0).toUpperCase() + webhook.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: webhook.errorType ? '#ef4444' : '#10b981' }}>
                    {webhook.errorType || '—'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                    {new Date(webhook.sentAt).toLocaleTimeString()}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#cbd5e1', textAlign: 'center' }}>
                    {webhook.retryCount > 0 ? (
                      <span style={{ color: '#f59e0b', fontWeight: 600 }}>{webhook.retryCount}</span>
                    ) : '0'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{
          padding: '1rem',
          borderTop: '1px solid rgba(148, 163, 184, 0.15)',
          color: '#94a3b8',
          fontSize: '0.85rem',
          textAlign: 'center'
        }}>
          Showing {filteredWebhooks.slice(0, 15).length} of {filteredWebhooks.length} webhooks
        </div>
      </div>

      {/* Footer Info */}
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: 'rgba(15, 23, 42, 0.4)',
        borderRadius: '10px',
        fontSize: '0.8rem',
        color: '#64748b',
        textAlign: 'center',
        border: '1px solid rgba(148, 163, 184, 0.1)'
      }}>
        <p style={{ margin: 0 }}>
          Dashboard refreshes every 5 seconds | Last update: {new Date().toLocaleTimeString()} | 
          {failedCount > 0 && ` ${failedCount} webhooks require attention`}
        </p>
      </div>
    </div>
  );
};

export default WebhookDashboard;
