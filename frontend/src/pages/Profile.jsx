import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Mail, User, Phone, MapPin, Building, Shield, Bell, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    company: user?.company || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const handleAction = (feature) => {
    alert(`${feature} functionality is coming soon!`);
  };

  const handleEditClick = () => {
    setFormData({
      name: user?.name || '',
      company: user?.company || '',
      phone: user?.phone || '',
      address: user?.address || ''
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('/api/auth/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.user);
      setIsEditing(false);
    } catch (err) {
      alert('Failed to update profile');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="page-wrapper main-content">
      <div className="page-header">
        <div>
          <h1>Your Profile</h1>
          <p>Manage your account settings and preferences.</p>
        </div>
      </div>

      <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        
        {/* Main Details */}
        <div className="profile-main" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* User Info Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '2.5rem', borderRadius: '24px' }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {user?.name || 'User Name'} <CheckCircle size={20} style={{ color: 'var(--success-text)' }} />
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Administrator Account</p>
              </div>
              {isEditing ? (
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
                  <button className="btn-secondary" onClick={handleCancel} disabled={isSaving}>Cancel</button>
                  <button className="btn-primary" onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Profile'}</button>
                </div>
              ) : (
                <button className="btn-secondary" style={{ marginLeft: 'auto' }} onClick={handleEditClick}>Edit Profile</button>
              )}
            </div>
            
            {isEditing ? (
              <div className="form-group" style={{ marginTop: '1rem', width: '100%' }}>
                <label>Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" />
              </div>
            ) : null}

            <div className="form-row" style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label><Mail size={14} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'text-top' }} /> Email Address</label>
                <div style={{ padding: '1rem 1.2rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff', opacity: isEditing ? 0.7 : 1, cursor: isEditing ? 'not-allowed' : 'default' }}>
                  {user?.email || 'admin@example.com'}
                </div>
              </div>
              <div className="form-group">
                <label><Building size={14} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'text-top' }} /> Company / Business</label>
                {isEditing ? (
                  <input type="text" name="company" value={formData.company} onChange={handleChange} className="form-control" placeholder="GammaFlow Solutions" />
                ) : (
                  <div style={{ padding: '1rem 1.2rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }}>
                    {user?.company || 'GammaFlow Solutions'}
                  </div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label><Phone size={14} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'text-top' }} /> Phone Number</label>
                {isEditing ? (
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="form-control" placeholder="+1 (555) 123-4567" />
                ) : (
                  <div style={{ padding: '1rem 1.2rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }}>
                    {user?.phone || '+1 (555) 123-4567'}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label><MapPin size={14} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'text-top' }} /> Address</label>
                {isEditing ? (
                  <input type="text" name="address" value={formData.address} onChange={handleChange} className="form-control" placeholder="300 Creative Street, NY" />
                ) : (
                  <div style={{ padding: '1rem 1.2rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }}>
                    {user?.address || '300 Creative Street, NY'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Business Settings */}
          <div className="card" style={{ padding: '2rem' }}>
             <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
               <Shield size={22} className="text-primary" style={{ color: 'var(--primary-color)' }} /> Security & Access
             </h3>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>Two-Factor Authentication</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Add an extra layer of security to your account.</p>
                  </div>
                  <button className="btn-secondary" style={{ padding: '0.6rem 1rem' }} onClick={() => handleAction('Two-Factor Authentication')}>Enable</button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>Login History</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>View recent sign-in activity and devices.</p>
                  </div>
                  <button className="btn-secondary" style={{ padding: '0.6rem 1rem' }} onClick={() => handleAction('Login History')}>View Log</button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem' }}>
                  <div>
                    <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>Change Password</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Regularly updating your password keeps your account secure.</p>
                  </div>
                  <button className="btn-secondary" style={{ padding: '0.6rem 1rem' }} onClick={() => handleAction('Change Password')}>Update</button>
                </div>
             </div>
          </div>

        </div>

        {/* Sidebar Status/Stats */}
        <div className="profile-side" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Subscription Banner */}
          <div className="card" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(236, 72, 153, 0.15))', border: '1px solid rgba(99, 102, 241, 0.3)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'var(--primary-color)', filter: 'blur(40px)', opacity: '0.4' }}></div>
            <h4 style={{ color: 'var(--primary-color)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', fontWeight: 700 }}>Subscription Plan</h4>
            <div style={{ fontSize: '2.5rem', color: '#fff', fontWeight: 700, marginBottom: '0.5rem', textShadow: '0 0 20px rgba(255,255,255,0.2)' }}>Pro Tier</div>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem' }}>Your plan is active and will auto-renew on May 1st, 2026.</p>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleAction('Manage Billing')}>Manage Billing</button>
          </div>

          {/* Preferences */}
          <div className="card" style={{ padding: '1.75rem' }}>
             <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
               <Bell size={18} /> Notification Preferences
             </h4>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary-color)', width: '18px', height: '18px' }} onChange={() => handleAction('Email Alerts')} />
                  <div>
                     <span style={{ fontSize: '0.95rem', color: 'var(--text-main)', display: 'block', fontWeight: 500 }}>Email Alerts</span>
                     <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Get notified when an invoice is viewed</span>
                  </div>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary-color)', width: '18px', height: '18px' }} onChange={() => handleAction('Weekly Reports')}/>
                  <div>
                     <span style={{ fontSize: '0.95rem', color: 'var(--text-main)', display: 'block', fontWeight: 500 }}>Weekly Reports</span>
                     <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Receive your weekly earnings summary</span>
                  </div>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ accentColor: 'var(--primary-color)', width: '18px', height: '18px' }} onChange={() => handleAction('Marketing & Offers')} />
                  <div>
                     <span style={{ fontSize: '0.95rem', color: 'var(--text-main)', display: 'block', fontWeight: 500 }}>Marketing & Offers</span>
                     <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Occasional tips and promotions</span>
                  </div>
                </label>
             </div>
          </div>
        </div>

      </div>
      
      <style>{`
        @media (max-width: 900px) {
          .profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Profile;
