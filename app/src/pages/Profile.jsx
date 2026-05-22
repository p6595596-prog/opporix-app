import { useState, useEffect } from 'react';
import { User, GraduationCap, Target, Save, CheckCircle } from 'lucide-react';
import './Profile.css';

const educationOptions = ['Class 10', 'Class 12 / 12th Pass', 'Pursuing UG', 'Graduate', 'Pursuing PG', 'Post Graduate', 'PhD'];
const categoryOptions = ['General', 'OBC', 'SC', 'ST', 'EWS'];

export default function Profile({ profile, onSave }) {
  const [form, setForm] = useState({ name: '', age: '', education: '', percentage: '', category: '', income: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        age: profile.age || '',
        education: profile.education || '',
        percentage: profile.percentage || '',
        category: profile.category || '',
        income: profile.income || ''
      });
    }
  }, [profile]);

  const handleChange = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    onSave({ ...form, age: Number(form.age), percentage: Number(form.percentage) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="profile-page anim-fade-up">
      <div className="profile-hero glass">
        <div className="profile-avatar-big">
          <User size={40} />
        </div>
        <div>
          <h1 className="profile-name">{form.name || 'Your Profile'}</h1>
          <p className="profile-sub">Set up your profile to see personalized Eligibility Match Scores on every opportunity</p>
        </div>
      </div>

      <div className="profile-grid">
        {/* Personal Info */}
        <div className="profile-card glass">
          <div className="card-section-title"><User size={16} /> Personal Info</div>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="e.g. Rahul Sharma" value={form.name} onChange={e => handleChange('name', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Age</label>
              <input type="number" className="form-input" placeholder="e.g. 22" value={form.age} onChange={e => handleChange('age', e.target.value)} min="10" max="60" />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input form-select" value={form.category} onChange={e => handleChange('category', e.target.value)}>
                <option value="">Select Category</option>
                {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Annual Family Income</label>
            <select className="form-input form-select" value={form.income} onChange={e => handleChange('income', e.target.value)}>
              <option value="">Select Income Range</option>
              <option value="below2">Below ₹2 LPA</option>
              <option value="2to6">₹2 – ₹6 LPA</option>
              <option value="6to8">₹6 – ₹8 LPA</option>
              <option value="above8">Above ₹8 LPA</option>
            </select>
          </div>
        </div>

        {/* Education */}
        <div className="profile-card glass">
          <div className="card-section-title"><GraduationCap size={16} /> Education</div>
          <div className="form-group">
            <label className="form-label">Current Education Level</label>
            <select className="form-input form-select" value={form.education} onChange={e => handleChange('education', e.target.value)}>
              <option value="">Select Level</option>
              {educationOptions.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Academic Percentage / CGPA (in %)</label>
            <input type="number" className="form-input" placeholder="e.g. 78" value={form.percentage} onChange={e => handleChange('percentage', e.target.value)} min="0" max="100" />
          </div>
        </div>

        {/* Match info */}
        <div className="profile-info-card glass">
          <div className="card-section-title"><Target size={16} /> Eligibility Match</div>
          <p className="info-text">Once you fill your profile, every opportunity card will show a <strong>Match Score</strong> showing how well you qualify — so you never waste time on opportunities you don't qualify for.</p>
          <div className="match-demo">
            <div className="match-bar" style={{ '--pct': `${form.age && form.education ? '82' : '0'}%` }}>
              <div className="match-fill" />
            </div>
            <span>{form.age && form.education ? '82% avg match across all listings' : 'Fill your profile to see match scores'}</span>
          </div>
        </div>
      </div>

      <div className="profile-save-row">
        <button className={`btn btn-primary btn-lg ${saved ? 'saved-pulse' : ''}`} onClick={handleSave}>
          {saved ? <><CheckCircle size={18} /> Saved!</> : <><Save size={18} /> Save Profile</>}
        </button>
        {saved && <p className="save-note">Your match scores are now active on all opportunity cards ✨</p>}
      </div>
    </div>
  );
}
