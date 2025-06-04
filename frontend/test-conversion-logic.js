// Test conversion logic for project configuration values

console.log("=== Testing Frontend ↔ Backend Conversion Logic ===\n");

// Simulate backend values (stored as decimals 0-1)
const backendData = {
  weightW1: 0.25,
  weightW2: 0.25, 
  weightW3: 0.25,
  weightW4: 0.25,
  freeriderThreshold: 0.3,
  pressureThreshold: 15 // This is not a percentage
};

console.log("1. Backend data (stored values):");
console.log(JSON.stringify(backendData, null, 2));

// Convert for frontend display (multiply by 100 for percentages)
const frontendDisplayData = {
  weightW1: backendData.weightW1 * 100, // 25%
  weightW2: backendData.weightW2 * 100, // 25%
  weightW3: backendData.weightW3 * 100, // 25%
  weightW4: backendData.weightW4 * 100, // 25%
  freeriderThreshold: backendData.freeriderThreshold * 100, // 30%
  pressureThreshold: backendData.pressureThreshold // 15 (no conversion)
};

console.log("\n2. Frontend display data (with % conversion):");
console.log(JSON.stringify(frontendDisplayData, null, 2));

// Convert back to backend format (divide by 100 for percentages)
const backToBackendData = {
  weightW1: frontendDisplayData.weightW1 / 100,
  weightW2: frontendDisplayData.weightW2 / 100,
  weightW3: frontendDisplayData.weightW3 / 100,
  weightW4: frontendDisplayData.weightW4 / 100,
  freeriderThreshold: frontendDisplayData.freeriderThreshold / 100,
  pressureThreshold: frontendDisplayData.pressureThreshold // No conversion
};

console.log("\n3. Converted back to backend format:");
console.log(JSON.stringify(backToBackendData, null, 2));

// Verify the conversion is lossless
const isConversionCorrect = JSON.stringify(backendData) === JSON.stringify(backToBackendData);
console.log("\n4. Conversion verification:");
console.log("Is conversion lossless?", isConversionCorrect ? "✅ YES" : "❌ NO");

console.log("\n=== Display Format Examples ===");
console.log("Free rider threshold: " + (backendData.freeriderThreshold * 100).toFixed(0) + "%");
console.log("Weight W1: " + (backendData.weightW1 * 100).toFixed(1) + "%");
console.log("Weight W2: " + (backendData.weightW2 * 100).toFixed(1) + "%");
console.log("Weight W3: " + (backendData.weightW3 * 100).toFixed(1) + "%");
console.log("Weight W4: " + (backendData.weightW4 * 100).toFixed(1) + "%");
console.log("Pressure threshold: " + backendData.pressureThreshold + " (no %)");

console.log("\n=== Summary ===");
console.log("✅ Free rider threshold: 0-1 in backend, display as 0-100% in frontend");
console.log("✅ Weight W1-W4: 0-1 in backend, display as 0-100% in frontend");
console.log("✅ Pressure threshold: Raw number in backend, display as raw number (no %) in frontend"); 