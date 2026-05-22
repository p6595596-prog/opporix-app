import { supabase } from '../lib/supabase';

export const getUserApplications = async (userId) => {
  const { data, error } = await supabase
    .from('user_applications')
    .select('*')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
  return data;
};

export const updateApplicationStatus = async (userId, opportunityId, status) => {
  // Upsert the record: if it exists, update it. If not, insert it.
  const { data, error } = await supabase
    .from('user_applications')
    .upsert({
      user_id: userId,
      opportunity_id: opportunityId,
      status: status,
      applied_date: status === 'Applied' ? new Date().toISOString() : null
    }, { onConflict: 'user_id, opportunity_id' })
    .select()
    .single();

  if (error) {
    console.error('Error updating application:', error);
    throw error;
  }
  return data;
};

export const deleteApplication = async (userId, opportunityId) => {
  const { error } = await supabase
    .from('user_applications')
    .delete()
    .match({ user_id: userId, opportunity_id: opportunityId });

  if (error) {
    console.error('Error deleting application:', error);
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
};

export const updateUserProfile = async (userId, profileData) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: profileData.name,
      age: profileData.age,
      education: profileData.education,
      percentage: profileData.percentage,
      category: profileData.category,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
  return data;
};

// ==========================================
// DOCUMENT VAULT (PHASE 4)
// ==========================================

export const getUserDocuments = async (userId) => {
  const { data, error } = await supabase
    .from('user_documents')
    .select('*')
    .eq('user_id', userId)
    .order('uploaded_at', { ascending: false });

  if (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
  return data;
};

export const uploadDocument = async (userId, file, documentType) => {
  const fileExt = file.name.split('.').pop();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${userId}/${Date.now()}_${safeName}`;

  // 1. Upload to Storage Bucket
  const { error: uploadError } = await supabase.storage
    .from('vault')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    throw uploadError;
  }

  // 2. Add metadata to Database
  const { data, error: dbError } = await supabase
    .from('user_documents')
    .insert([
      {
        user_id: userId,
        document_type: documentType,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size
      }
    ])
    .select()
    .single();

  if (dbError) {
    console.error('Error saving document metadata:', dbError);
    throw dbError;
  }
  
  return data;
};

export const deleteDocument = async (userId, documentId, filePath) => {
  // 1. Delete from Storage
  const { error: storageError } = await supabase.storage
    .from('vault')
    .remove([filePath]);

  if (storageError) {
    console.error('Error deleting file from storage:', storageError);
    throw storageError;
  }

  // 2. Delete from Database
  const { error: dbError } = await supabase
    .from('user_documents')
    .delete()
    .match({ id: documentId, user_id: userId });

  if (dbError) {
    console.error('Error deleting document metadata:', dbError);
    throw dbError;
  }
};

export const getDocumentUrl = (filePath) => {
  const { data } = supabase.storage.from('vault').getPublicUrl(filePath);
  return data.publicUrl;
};
