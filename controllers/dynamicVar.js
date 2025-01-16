// dynamicVar.js
let dynamicValue = "image"; // Initialize the variable

// Function to update the value dynamically
const setDynamicValue = (newValue) => {
  dynamicValue = newValue;
};

// Getter to access the current value
const getDynamicValue = () => {
  console.log(dynamicValue);

  return dynamicValue;
};

// Export both the variable and the functions
module.exports = {
  getDynamicValue,
  setDynamicValue,
};
