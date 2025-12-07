import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { FiAlertCircle } from 'react-icons/fi';
import Button from '../components/ui/Button';

const ClaimGift = () => {
  const { qrCodeId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkClaimStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/gift-cards/claim-status/${qrCodeId}`);
        const { isClaimed, linkedGiftCard } = response.data.data;

        if (isClaimed && linkedGiftCard) {
          // Redirect to viewer
          navigate(`/view/${linkedGiftCard.uniqueSlug}`);
        } else {
          // Redirect to builder with qrCodeId
          navigate(`/gallery/new/create-gift-card?qrCodeId=${qrCodeId}`);
        }

      } catch (err) {
        console.error('Error checking claim status:', err);
        setError('Invalid or expired QR code.');
      } finally {
        setLoading(false);
      }
    };

    checkClaimStatus();
  }, [qrCodeId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Checking gift status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-100">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Error</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <Button
            onClick={() => navigate('/')}
            className="w-full"
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return null; // Redirecting...
};

export default ClaimGift;
