export const downloadReceipt = async (purchaseId, userId, fileName = 'receipt') => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/receipts/download-txt/${purchaseId}?userId=${userId}`
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
      `http://localhost:5000/api/receipts/receipt/${purchaseId}?userId=${userId}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch receipt');
    }

    const data = await response.json();
    return data.receipt;
  } catch (error) {
    console.error('Error fetching receipt:', error);
    throw error;
  }
};

export const recordPurchase = async (projectId, tier, price, userEmail, userName) => {
  try {
    const response = await fetch('http://localhost:5000/api/purchases/record-purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify({
        projectId,
        tier: tier || 'Tier 1',
        price,
        userEmail,
        userName,
        userId: localStorage.getItem('userId')
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to record purchase');
    }

    const data = await response.json();
    return data.purchase;
  } catch (error) {
    console.error('Error recording purchase:', error);
    throw error;
  }
};

export const checkPurchaseStatus = async (projectId, userId) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/purchases/check-purchase/${projectId}?userId=${userId}`
    );

    if (!response.ok) {
      return { purchased: false };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking purchase status:', error);
    return { purchased: false };
  }
};

export const upgradePurchase = async (projectId, newTier, priceIncrease) => {
  try {
    const response = await fetch('http://localhost:5000/api/purchases/upgrade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify({
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
