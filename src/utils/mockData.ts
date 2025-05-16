
// Generate mock data for the app
export const generateMockData = () => {
  return [
    { month: "Jan", sales: 400, profit: 240, units: 100 },
    { month: "Feb", sales: 300, profit: 138, units: 80 },
    { month: "Mar", sales: 200, profit: 80, units: 70 },
    { month: "Apr", sales: 278, profit: 140, units: 90 },
    { month: "May", sales: 189, profit: 76, units: 60 },
    { month: "Jun", sales: 239, profit: 120, units: 70 },
    { month: "Jul", sales: 349, profit: 180, units: 95 },
    { month: "Aug", sales: 430, profit: 260, units: 110 },
    { month: "Sep", sales: 350, profit: 175, units: 85 },
    { month: "Oct", sales: 320, profit: 160, units: 83 },
    { month: "Nov", sales: 400, profit: 220, units: 105 },
    { month: "Dec", sales: 500, profit: 350, units: 120 },
  ];
};

export const getAvailableDataIndicators = () => {
  return ["month", "sales", "profit", "units"];
};

// Generate mock data for different datasets
export const generateDatasets = () => {
  return {
    sales: generateMockData(),
    temperature: [
      { city: "New York", temp: 17, humidity: 65, pressure: 1012 },
      { city: "London", temp: 15, humidity: 70, pressure: 1008 },
      { city: "Tokyo", temp: 23, humidity: 50, pressure: 1015 },
      { city: "Paris", temp: 19, humidity: 60, pressure: 1010 },
      { city: "Sydney", temp: 25, humidity: 45, pressure: 1020 },
      { city: "Berlin", temp: 14, humidity: 72, pressure: 1007 },
      { city: "Moscow", temp: 8, humidity: 80, pressure: 998 },
      { city: "Beijing", temp: 20, humidity: 55, pressure: 1018 },
    ],
    analytics: [
      { page: "Home", views: 5400, bounce: 32, duration: 120 },
      { page: "About", views: 2100, bounce: 45, duration: 90 },
      { page: "Services", views: 3200, bounce: 38, duration: 140 },
      { page: "Blog", views: 4800, bounce: 25, duration: 180 },
      { page: "Contact", views: 1800, bounce: 50, duration: 60 },
      { page: "Products", views: 3900, bounce: 28, duration: 150 },
    ],
  };
};
