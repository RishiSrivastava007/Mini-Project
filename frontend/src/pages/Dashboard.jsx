import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [stats, setStats] = useState({ revenue: 0, pending: 0, total: 0 });

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/api/invoices', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }})
      .then(res => {
        const invoices = res.data;
        const revenue = invoices.filter(i => i.is_paid).reduce((sum, curr) => sum + curr.amount, 0);
        const pending = invoices.filter(i => !i.is_paid).reduce((sum, curr) => sum + curr.amount, 0);
        setStats({ revenue, pending, total: invoices.length });
      });
  }, []);

  return (
    <div>
      <div className="form-row">
         <div className="form-section" style={{flex:1, textAlign:'center'}}>
           <h3 style={{marginBottom:'0.5rem', color:'var(--text-muted)'}}>Total Revenue</h3>
           <p style={{fontSize:'2.5rem', color:'#16a34a', fontWeight:'700'}}>${stats.revenue.toFixed(2)}</p>
         </div>
         <div className="form-section" style={{flex:1, textAlign:'center'}}>
           <h3 style={{marginBottom:'0.5rem', color:'var(--text-muted)'}}>Pending Payments</h3>
           <p style={{fontSize:'2.5rem', color:'#ea580c', fontWeight:'700'}}>${stats.pending.toFixed(2)}</p>
         </div>
         <div className="form-section" style={{flex:1, textAlign:'center'}}>
           <h3 style={{marginBottom:'0.5rem', color:'var(--text-muted)'}}>Total Invoices</h3>
           <p style={{fontSize:'2.5rem', fontWeight:'700'}}>{stats.total}</p>
         </div>
      </div>
    </div>
  );
}
