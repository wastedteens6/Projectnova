import api from '../lib/api';
export const downloadReceipt = async (purchaseId, userId, fileName = 'receipt') => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/receipts/download-txt/${purchaseId}?userId=${userId}`
    );

    if (!response.ok) {
      throw new Error('Failed to download receipt');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error downloading receipt:', error);
    throw error;
  }
};

export const getReceipt = async (purchaseId, userId) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/receipts/receipt/${purchaseId}?userId=${userId}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch receipt');
    }

    const data = await response.json();
    return data.receipt;
  } catch (error) {
    console.error('Error fetching receipt:', error);
        projectId,
        newTier,
        priceIncrease,
        userId: localStorage.getItem('userId')
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upgrade purchase');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error upgrading purchase:', error);
    throw error;
  }
};
