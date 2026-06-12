import api from '../lib/api';

export const downloadReceipt = async (purchaseId: string, userId: string, fileName = 'receipt') => {
  try {
    const response = await api.get(
      `/receipts/download-txt/${purchaseId}?userId=${userId}`,
      { responseType: 'blob' }
    );

    const url = window.URL.createObjectURL(response.data);
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

export const getReceipt = async (purchaseId: string, userId: string) => {
  try {
    const response = await api.get(`/receipts/receipt/${purchaseId}?userId=${userId}`);
    return response.data.receipt;
  } catch (error) {
    console.error('Error fetching receipt:', error);
    throw error;
  }
};

export const upgradePurchase = async (projectId: string, newTier: string, priceIncrease: number) => {
  try {
    const response = await api.post('/purchases/upgrade-tier/confirm', {
      projectId,
      newTier,
      priceIncrease,
      userId: localStorage.getItem('userId')
    });
    return response.data;
  } catch (error) {
    console.error('Error upgrading purchase:', error);
    throw error;
  }
};
