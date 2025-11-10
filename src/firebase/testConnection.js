import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "./config";

/**
 * Test Firestore connection and permissions
 * This function helps diagnose connection and permission issues
 */
export const testFirestoreConnection = async () => {
  console.log("🔍 Testing Firestore connection...");

  try {
    // Test 1: Check if we can connect to Firestore
    console.log("Test 1: Checking Firestore connection...");
    const testCollectionRef = collection(db, "test-connection");
    console.log("✅ Connection established");

    // Test 2: Try to write a test document
    console.log("Test 2: Testing write permissions...");
    const testDocRef = doc(db, "test-connection", "test-doc");
    await setDoc(testDocRef, {
      test: true,
      timestamp: new Date().toISOString(),
    });
    console.log("✅ Write successful");

    // Test 3: Try to read the test document
    console.log("Test 3: Testing read permissions...");
    const testDocs = await getDocs(testCollectionRef);
    console.log(`✅ Read successful (found ${testDocs.size} documents)`);

    // Test 4: Try to access hierarchical structure
    console.log("Test 4: Testing hierarchical structure access...");
    const hierarchicalPath = collection(
      db,
      "constituencies/pileru/mandals/gurramkonda/panchayats/cherlopalle/persons"
    );
    const hierarchicalDocs = await getDocs(hierarchicalPath);
    console.log(
      `✅ Hierarchical access successful (found ${hierarchicalDocs.size} documents)`
    );

    console.log("\n🎉 All tests passed! Firestore is working correctly.");
    return {
      success: true,
      message: "All tests passed",
    };
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.error("Error code:", error.code);
    console.error("Full error:", error);

    let solution = "";
    if (
      error.code === "permission-denied" ||
      error.message.includes("permission")
    ) {
      solution = `
🔧 SOLUTION: Update Firestore Security Rules

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project
3. Click "Firestore Database" → "Rules" tab
4. Replace rules with:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}

5. Click "Publish"
6. Refresh your app
`;
    } else if (error.code === "unavailable") {
      solution = `
🔧 SOLUTION: Check Network Connection

1. Verify you're connected to the internet
2. Check if Firebase is accessible in your region
3. Try disabling any VPN or firewall
`;
    }

    console.log(solution);

    return {
      success: false,
      error: error.message,
      code: error.code,
      solution,
    };
  }
};

/**
 * Test location-specific access
 */
export const testLocationAccess = async (constituency, mandal, panchayat) => {
  console.log(
    `\n🔍 Testing access to ${constituency}/${mandal}/${panchayat}...`
  );

  try {
    const constituencyLower = constituency.toLowerCase();
    const mandalLower = mandal.toLowerCase();
    const panchayatLower = panchayat.toLowerCase();

    const personsRef = collection(
      db,
      `constituencies/${constituencyLower}/mandals/${mandalLower}/panchayats/${panchayatLower}/persons`
    );

    const snapshot = await getDocs(personsRef);
    console.log(`✅ Successfully accessed location (${snapshot.size} persons)`);

    return {
      success: true,
      count: snapshot.size,
    };
  } catch (error) {
    console.error(`❌ Failed to access location:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Quick test function - run this in browser console
 * Open browser console and type: testFirebase()
 */
window.testFirebase = testFirestoreConnection;
window.testLocation = testLocationAccess;
