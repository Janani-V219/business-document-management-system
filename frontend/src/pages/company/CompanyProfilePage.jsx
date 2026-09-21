import React, { useState, useEffect } from 'react';
import { companyService } from '../../services/companyService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  Save,
  Upload,
  Globe,
  Mail,
  Phone,
  CreditCard,
  FileCheck,
} from 'lucide-react';

export const CompanyProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();
  const { isAdmin } = useAuth();

  const [formData, setFormData] = useState({
    company_name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    gst_number: '',
    pan_number: '',
    bank_name: '',
    account_details: '',
    payment_information: '',
    default_terms: '',
  });

  const [logoFile, setLogoFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await companyService.getProfile();
      setProfile(data);
      setFormData({
        company_name: data.company_name || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
        gst_number: data.gst_number || '',
        pan_number: data.pan_number || '',
        bank_name: data.bank_name || '',
        account_details: data.account_details || '',
        payment_information: data.payment_information || '',
        default_terms: data.default_terms || '',
      });
    } catch (err) {
      showToast('Failed to load company profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('Only administrators can update the company profile', 'error');
      return;
    }

    setSaving(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      if (logoFile) {
        data.append('logo', logoFile);
      }
      if (signatureFile) {
        data.append('signature', signatureFile);
      }

      const updated = await companyService.updateProfile(data);
      setProfile(updated);
      showToast('Company profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to update company profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-indigo-600" />
            Company Profile & Branding
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Branding, tax details, and bank wire information auto-injected into quotation and invoice templates.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs shadow-indigo-600/20 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Profile</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Brand & Logo Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Identity & Contact
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo upload */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Company Logo
              </label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                  {logoFile ? (
                    <img
                      src={URL.createObjectURL(logoFile)}
                      alt="Logo preview"
                      className="w-full h-full object-contain p-2"
                    />
                  ) : profile?.logo_url ? (
                    <img
                      src={profile.logo_url}
                      alt="Company logo"
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <Upload className="w-6 h-6 text-slate-400" />
                  )}
                </div>

                {isAdmin && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      id="logo-upload"
                      className="hidden"
                      onChange={(e) => setLogoFile(e.target.files[0])}
                    />
                    <label
                      htmlFor="logo-upload"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Logo
                    </label>
                    <p className="text-[11px] text-slate-400 mt-1">PNG, JPG or SVG up to 2MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Digital Signature */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Authorized Signature / Stamp
              </label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                  {signatureFile ? (
                    <img
                      src={URL.createObjectURL(signatureFile)}
                      alt="Signature preview"
                      className="w-full h-full object-contain p-2"
                    />
                  ) : profile?.signature_url ? (
                    <img
                      src={profile.signature_url}
                      alt="Authorized signature"
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <FileCheck className="w-6 h-6 text-slate-400" />
                  )}
                </div>

                {isAdmin && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      id="sig-upload"
                      className="hidden"
                      onChange={(e) => setSignatureFile(e.target.files[0])}
                    />
                    <label
                      htmlFor="sig-upload"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Signature
                    </label>
                    <p className="text-[11px] text-slate-400 mt-1">Transparent PNG recommended</p>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Company Legal Name *
              </label>
              <input
                type="text"
                required
                disabled={!isAdmin}
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Official Email
              </label>
              <input
                type="email"
                disabled={!isAdmin}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Official Phone
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Website
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Registered Office Address
              </label>
              <textarea
                rows={2}
                disabled={!isAdmin}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Tax & Banking Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Tax & Bank Payment Wire Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                GSTIN / Tax ID
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                placeholder="e.g. 36AAACA1234A1Z5"
                value={formData.gst_number}
                onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                PAN Number
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                placeholder="e.g. AAACA1234A"
                value={formData.pan_number}
                onChange={(e) => setFormData({ ...formData, pan_number: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Bank Name
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                placeholder="e.g. HDFC Bank Ltd"
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Account Details (A/C, IFSC, SWIFT)
              </label>
              <textarea
                rows={2}
                disabled={!isAdmin}
                placeholder="A/C: 50200012345678&#10;IFSC: HDFC0001234"
                value={formData.account_details}
                onChange={(e) => setFormData({ ...formData, account_details: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Alternative Payment Methods (UPI, PayPal, QR Link)
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                placeholder="UPI ID: company@bank | PayPal: paypal.me/company"
                value={formData.payment_information}
                onChange={(e) => setFormData({ ...formData, payment_information: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Default Terms & Conditions
              </label>
              <textarea
                rows={4}
                disabled={!isAdmin}
                value={formData.default_terms}
                onChange={(e) => setFormData({ ...formData, default_terms: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
