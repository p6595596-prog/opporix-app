const API_BASE_URL = 'http://localhost:5000/api';

export const fetchOpportunities = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/opportunities`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching live opportunities:', error);
    return [];
  }
};
