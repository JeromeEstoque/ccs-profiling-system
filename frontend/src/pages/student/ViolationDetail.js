import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { violationsAPI } from '../../services/api';
import Card from '../../components/common/Card';
import { AlertTriangle, Calendar, User, FileText, ArrowLeft, CheckCircle, Clock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ViolationDetail = () => {
  const { violationId } = useParams();
  const navigate = useNavigate();
  const [violation, setViolation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchViolationDetails();
  }, [violationId]);

  const fetchViolationDetails = async () => {
    try {
      setLoading(true);
      const response = await violationsAPI.getById(violationId);
      if (response.data.success) {
        setViolation(response.data.violation);
      } else {
        toast.error('Violation not found');
        navigate('/student/violations');
      }
    } catch (error) {
      console.error('Error fetching violation details:', error);
      toast.error('Failed to load violation details');
      navigate('/student/violations');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'Major': 'bg-red-100 text-red-700 border-red-200',
      'Minor': 'bg-yellow-100 text-yellow-700 border-yellow-200'
    };
    return colors[severity] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-amber-100 text-amber-700',
      'Resolved': 'bg-green-100 text-green-700',
      'Under Investigation': 'bg-blue-100 text-blue-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading violation details...</p>
        </div>
      </div>
    );
  }

  if (!violation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Violation Not Found</h2>
          <p className="text-gray-500 mb-4">The violation you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/student/violations')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Violations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-purple-100 relative z-10">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 px-4 py-3 shadow-lg sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/student/violations')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Violation Details</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className={`px-3 py-1 rounded-full font-medium border ${getSeverityColor(violation.severity)}`}>
              {violation.severity}
            </span>
            <span className={`px-3 py-1 rounded-full font-medium ${getStatusColor(violation.status)}`}>
              {violation.status}
            </span>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Violation Summary */}
        <Card className="mb-6">
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 ${getSeverityColor(violation.severity)}`}>
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{violation.violation_type || violation.type}</h2>
              <p className="text-gray-600 mb-4">{violation.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(violation.date_created || violation.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Reported By</p>
                    <p className="text-gray-900 font-medium">
                      {violation.reported_by || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="text-gray-900 font-medium">{violation.status}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Detailed Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card title="Violation Details" icon={FileText}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Violation Type</label>
                <p className="text-gray-900 font-medium">{violation.violation_type || violation.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Severity</label>
                <p className="text-gray-900 font-medium">{violation.severity}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-900">{violation.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
                <p className="text-gray-900">{violation.location || 'N/A'}</p>
              </div>
            </div>
          </Card>

          <Card title="Resolution Information" icon={CheckCircle}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(violation.status)}`}>
                  {violation.status}
                </span>
              </div>
              {violation.resolved_date && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Resolved Date</label>
                  <p className="text-gray-900 font-medium">
                    {new Date(violation.resolved_date).toLocaleDateString()}
                  </p>
                </div>
              )}
              {violation.resolution_remarks && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Resolution Remarks</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{violation.resolution_remarks}</p>
                </div>
              )}
              {violation.status === 'Pending' && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                  <p className="text-amber-700 text-sm">
                    <strong>Note:</strong> This violation is currently pending resolution.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Actions */}
        {violation.status === 'Pending' && (
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Need Assistance?</h3>
                <p className="text-gray-600 text-sm">
                  If you believe this violation was recorded in error, please contact the guidance office.
                </p>
              </div>
              <button
                onClick={() => navigate('/student/profile')}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Contact Guidance
              </button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ViolationDetail;
