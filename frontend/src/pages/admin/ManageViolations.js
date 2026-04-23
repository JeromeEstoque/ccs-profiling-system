import React, { useEffect, useState } from 'react';
import { violationsAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { Search, CheckCircle, Eye, Filter, AlertTriangle, Loader2, User, Calendar, Clock } from 'lucide-react';

const ManageViolations = () => {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: '' });
  const [showViewModal, setShowViewModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [resolveRemarks, setResolveRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchViolations();
  }, [filters]);

  const fetchViolations = async () => {
    setLoading(true);
    try {
      const response = await violationsAPI.getAll({ ...filters, search: searchTerm });
      if (response.data.success) {
        setViolations(response.data.violations);
      }
    } catch (error) {
      console.error('Error fetching violations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchViolations();
  };

  const handleResolve = async () => {
    if (!selectedViolation) return;
    setSaving(true);
    try {
      await violationsAPI.resolve(selectedViolation.id, resolveRemarks);
      toast.success('Violation resolved');
      setShowResolveModal(false);
      setResolveRemarks('');
      fetchViolations();
    } catch (error) {
      toast.error('Failed to resolve violation');
    } finally {
      setSaving(false);
    }
  };

  const openViewModal = (violation) => {
    setSelectedViolation(violation);
    setShowViewModal(true);
  };

  const openResolveModal = (violation) => {
    setSelectedViolation(violation);
    setResolveRemarks('');
    setShowResolveModal(true);
  };

  const pendingCount = violations.filter(v => v.status === 'Pending').length;
  const resolvedCount = violations.filter(v => v.status === 'Resolved').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-red-200 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Disciplinary Records</span>
          </div>
          <h1 className="text-2xl font-bold">Manage Violations</h1>
          <div className="flex gap-6 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-300 rounded-full"></div>
              <span className="text-red-100 text-sm">{pendingCount} Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-300 rounded-full"></div>
              <span className="text-red-100 text-sm">{resolvedCount} Resolved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px] relative">
            <label className="label">Search Violations</label>
            <div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student name or ID..."
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="label">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="input-field w-auto"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          <button type="submit" className="btn-primary">Search</button>
        </form>
      </Card>

      {/* Violations Table */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : violations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Violation</th>
                  <th>Date</th>
                  <th>Encoded By</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {violations.map((violation) => (
                  <tr key={violation.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-secondary-800">{violation.student_first_name} {violation.student_last_name}</p>
                          <p className="text-xs text-secondary-500">{violation.student_id}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`inline-flex items-center gap-1.5 ${
                        violation.violation_type.includes('Major') ? 'text-red-600' : 'text-orange-600'
                      }`}>
                        <AlertTriangle className="w-4 h-4" />
                        {violation.violation_type}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-secondary-600">
                        <Calendar className="w-4 h-4 text-secondary-400" />
                        {violation.date}
                      </div>
                    </td>
                    <td className="text-secondary-600">{violation.encoded_by_name || 'Admin'}</td>
                    <td>
                      <span className={`badge ${
                        violation.status === 'Pending' ? 'badge-warning' : 'badge-success'
                      }`}>
                        {violation.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openViewModal(violation)}
                          className="p-2 text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {violation.status === 'Pending' && (
                          <button
                            onClick={() => openResolveModal(violation)}
                            className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                            title="Resolve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state py-16">
            <AlertTriangle className="w-12 h-12" />
            <p className="text-base font-medium">No violations found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </Card>

      {/* View Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Violation Details"
      >
        {selectedViolation && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-secondary-200">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-secondary-800">
                  {selectedViolation.student_first_name} {selectedViolation.student_last_name}
                </h3>
                <p className="text-sm text-secondary-500">{selectedViolation.student_id}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-secondary-50 rounded-lg">
                <p className="text-xs text-secondary-500 uppercase tracking-wide">Violation Type</p>
                <p className="font-medium text-secondary-800">{selectedViolation.violation_type}</p>
              </div>
              <div className="p-3 bg-secondary-50 rounded-lg">
                <p className="text-xs text-secondary-500 uppercase tracking-wide">Date</p>
                <p className="font-medium text-secondary-800">{selectedViolation.date}</p>
              </div>
              <div className="p-3 bg-secondary-50 rounded-lg">
                <p className="text-xs text-secondary-500 uppercase tracking-wide">Status</p>
                <p className="font-medium">
                  <span className={`badge ${
                    selectedViolation.status === 'Pending' ? 'badge-warning' : 'badge-success'
                  }`}>
                    {selectedViolation.status}
                  </span>
                </p>
              </div>
              <div className="p-3 bg-secondary-50 rounded-lg">
                <p className="text-xs text-secondary-500 uppercase tracking-wide">Encoded By</p>
                <p className="font-medium text-secondary-800">{selectedViolation.encoded_by_name || 'Admin'}</p>
              </div>
              <div className="p-3 bg-secondary-50 rounded-lg col-span-2">
                <p className="text-xs text-secondary-500 uppercase tracking-wide">Remarks</p>
                <p className="font-medium text-secondary-800">{selectedViolation.remarks || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Resolve Modal */}
      <Modal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        title="Resolve Violation"
      >
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-green-800 font-medium">Mark this violation as resolved?</p>
            <p className="text-green-600 text-sm mt-1">This action will update the violation status.</p>
          </div>
          <div>
            <label className="label">Resolution Remarks</label>
            <textarea
              value={resolveRemarks}
              onChange={(e) => setResolveRemarks(e.target.value)}
              rows={3}
              className="input-field"
              placeholder="Add remarks about the resolution..."
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowResolveModal(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button onClick={handleResolve} disabled={saving} className="btn-success flex-1 flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Resolving...' : 'Resolve'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageViolations;
