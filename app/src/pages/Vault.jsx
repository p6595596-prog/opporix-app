import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, UploadCloud, FileText, Trash2, Download, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserDocuments, uploadDocument, deleteDocument, getDocumentUrl } from '../services/db';
import './Vault.css';

const documentTypes = [
  'ID Proof', '10th Marksheet', '12th Marksheet', 'Degree/UG', 
  'Caste Certificate', 'Income Certificate', 'Passport Photo', 'Signature', 'Other'
];

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function Vault() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Upload State
  const [selectedType, setSelectedType] = useState('ID Proof');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user]);

  const loadDocuments = async () => {
    setLoading(true);
    const docs = await getUserDocuments(user.id);
    setDocuments(docs);
    setLoading(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB');
      return;
    }

    try {
      setUploading(true);
      setError('');
      await uploadDocument(user.id, file, selectedType);
      await loadDocuments(); // Reload list after successful upload
    } catch (err) {
      console.error(err);
      setError('Failed to upload document. Make sure your Storage Bucket is set up correctly.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (doc) => {
    if (!confirm(`Are you sure you want to delete ${doc.file_name}?`)) return;
    
    try {
      await deleteDocument(user.id, doc.id, doc.file_path);
      setDocuments(documents.filter(d => d.id !== doc.id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete document');
    }
  };

  const handleDownload = (filePath) => {
    const url = getDocumentUrl(filePath);
    window.open(url, '_blank');
  };

  return (
    <div className="vault-page anim-fade-up">
      <div className="vault-header">
        <h1>Secure Document Vault</h1>
        <p>Store your standard application documents securely to reuse them instantly.</p>
      </div>

      <div className="vault-grid">
        {/* Upload Section */}
        <div className="upload-card glass">
          <h3><UploadCloud size={20} /> Upload New Document</h3>
          
          <div className="form-group">
            <label className="form-label">Document Type</label>
            <select 
              className="form-input form-select" 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              disabled={uploading}
            >
              {documentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {error && (
            <div style={{ color: 'var(--danger)', fontSize: '0.9rem', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {uploading ? (
            <div className="uploading-state">
              <Loader2 size={32} className="spinner" />
              <span>Securely uploading...</span>
            </div>
          ) : (
            <div className="file-drop-area" onClick={() => fileInputRef.current?.click()}>
              <UploadCloud size={32} className="upload-icon" />
              <p><strong>Click to browse</strong> or drag file here</p>
              <p className="upload-hint">PDF, JPG, or PNG (Max 5MB)</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>
          )}
        </div>

        {/* Document List */}
        <div className="documents-card glass">
          <h3><ShieldCheck size={20} /> Your Vault ({documents.length})</h3>
          
          {loading ? (
            <div className="empty-vault"><Loader2 className="spinner" /> Loading vault...</div>
          ) : documents.length === 0 ? (
            <div className="empty-vault">
              <FileText size={48} />
              <p>Your vault is empty.</p>
              <p style={{fontSize: '0.85rem'}}>Upload your first document to get started.</p>
            </div>
          ) : (
            <div className="doc-list">
              {documents.map(doc => (
                <div key={doc.id} className="doc-item">
                  <div className="doc-info">
                    <div className="doc-icon">
                      <FileText size={24} />
                    </div>
                    <div className="doc-details">
                      <h4>{doc.document_type}</h4>
                      <div className="doc-meta">
                        <span>{doc.file_name}</span>
                        <span>•</span>
                        <span>{formatBytes(doc.file_size)}</span>
                        <span>•</span>
                        <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="doc-actions">
                    <button 
                      className="btn-icon" 
                      title="View / Download"
                      onClick={() => handleDownload(doc.file_path)}
                    >
                      <Download size={18} />
                    </button>
                    <button 
                      className="btn-icon danger" 
                      title="Delete"
                      onClick={() => handleDelete(doc)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
