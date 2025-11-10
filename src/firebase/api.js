import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "./config";

// ===== HELPER FUNCTIONS =====

/**
 * Extract storage path from Firebase Storage download URL
 * @param {string} downloadURL - The Firebase Storage download URL
 * @returns {string} - The storage path
 */
const extractStoragePathFromURL = (downloadURL) => {
  if (!downloadURL) {
    throw new Error("Download URL is required");
  }

  // If it's already a path (doesn't contain firebasestorage.googleapis.com)
  if (!downloadURL.includes("firebasestorage.googleapis.com")) {
    return downloadURL;
  }

  // Extract path from Firebase Storage URL
  // URL format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
  const pathMatch = downloadURL.match(/\/o\/(.+?)(\?|$)/);

  if (pathMatch && pathMatch[1]) {
    // Decode the URL-encoded path
    const storagePath = decodeURIComponent(pathMatch[1]);
    return storagePath;
  }

  throw new Error(`Invalid Firebase Storage URL: ${downloadURL}`);
};

// ===== PERSON DATA OPERATIONS =====

/**
 * Save a person's data to Firestore with hierarchical structure
 * Structure: constituencies/{constituency}/mandals/{mandal}/panchayats/{panchayat}/persons/{docId}
 * @param {string} committeeType - 'party' or 'affiliated'
 * @param {object} personData - The person object
 * @returns {Promise<string>} - Returns the document ID
 */
export const savePerson = async (committeeType, personData) => {
  try {
    const {
      serialNo,
      name,
      voterId,
      photo,
      documents,
      constituency,
      mandal,
      panchayat,
      ...rest
    } = personData;

    // Validate required location fields
    if (!constituency || !mandal || !panchayat) {
      throw new Error("Constituency, mandal, and panchayat are required");
    }

    // Prepare location data for file uploads (convert to lowercase)
    const locationData = {
      constituency: constituency.toLowerCase(),
      mandal: mandal.toLowerCase(),
      panchayat: panchayat.toLowerCase(),
    };

    // Upload photo if exists (or keep existing photoURL)
    let photoURL = null;
    if (photo instanceof File) {
      photoURL = await uploadPhoto(
        committeeType,
        serialNo,
        photo,
        locationData
      );
    } else if (typeof photo === "string") {
      // Photo is already uploaded (URL string)
      photoURL = photo;
    } else if (personData.photoURL) {
      // Use existing photoURL from personData
      photoURL = personData.photoURL;
    }

    // Upload documents if exist
    let documentURLs = [];
    if (documents && documents.length > 0) {
      // Separate new documents (with file) from existing documents (with url)
      const newDocuments = documents.filter((doc) => doc.file instanceof File);
      const existingDocuments = documents.filter((doc) => doc.url && !doc.file);

      // Upload only new documents
      if (newDocuments.length > 0) {
        const uploadedDocs = await uploadDocuments(
          committeeType,
          serialNo,
          newDocuments,
          locationData
        );
        documentURLs = [...existingDocuments, ...uploadedDocs];
      } else {
        // All documents are already uploaded
        documentURLs = existingDocuments;
      }
    }

    // Use a custom document ID based on committeeType and serialNo
    const docId = `${committeeType}_${serialNo}`;

    // Create hierarchical path: constituencies/{constituency}/mandals/{mandal}/panchayats/{panchayat}/persons/{docId}
    const docPath = `constituencies/${locationData.constituency}/mandals/${locationData.mandal}/panchayats/${locationData.panchayat}/persons/${docId}`;
    const docRef = doc(db, docPath);

    // Check if document exists to determine if we need to set createdAt
    const docSnap = await getDoc(docRef);
    const isNewDocument = !docSnap.exists();

    // Prepare data for Firestore (with lowercase location data)
    const dataToSave = {
      committeeType,
      serialNo,
      name,
      voterId,
      photoURL,
      documents: documentURLs,
      constituency: locationData.constituency,
      mandal: locationData.mandal,
      panchayat: locationData.panchayat,
      ...rest,
      updatedAt: serverTimestamp(),
    };

    // Only set createdAt for new documents
    if (isNewDocument) {
      dataToSave.createdAt = serverTimestamp();
    }

    await setDoc(docRef, dataToSave, { merge: true });

    console.log("Person saved successfully:", docId, "at", docPath);
    return docId;
  } catch (error) {
    console.error("Error saving person:", error);
    throw error;
  }
};

/**
 * Save multiple persons at once
 * @param {string} committeeType - 'party' or 'affiliated'
 * @param {Array} persons - Array of person objects
 * @returns {Promise<Array>} - Returns array of saved document IDs
 */
export const saveMultiplePersons = async (committeeType, persons) => {
  try {
    const promises = persons.map((person) => savePerson(committeeType, person));
    const results = await Promise.all(promises);
    console.log("All persons saved successfully");
    return results;
  } catch (error) {
    console.error("Error saving multiple persons:", error);
    throw error;
  }
};

/**
 * Get a person's data from Firestore
 * @param {string} committeeType - 'party' or 'affiliated'
 * @param {number} serialNo - Serial number of the person
 * @param {string} constituency - Constituency name
 * @param {string} mandal - Mandal name
 * @param {string} panchayat - Panchayat name
 * @returns {Promise<object>} - Returns the person data
 */
export const getPerson = async (
  committeeType,
  serialNo,
  constituency,
  mandal,
  panchayat
) => {
  try {
    if (!constituency || !mandal || !panchayat) {
      throw new Error("Constituency, mandal, and panchayat are required");
    }

    const docId = `${committeeType}_${serialNo}`;
    const constituencyLower = constituency.toLowerCase();
    const mandalLower = mandal.toLowerCase();
    const panchayatLower = panchayat.toLowerCase();

    const docPath = `constituencies/${constituencyLower}/mandals/${mandalLower}/panchayats/${panchayatLower}/persons/${docId}`;
    const docRef = doc(db, docPath);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error("Person not found");
    }
  } catch (error) {
    console.error("Error getting person:", error);
    throw error;
  }
};

/**
 * Get all persons of a specific committee type (deprecated - use getPersonsByLocation instead)
 * This function is kept for backward compatibility but requires location parameters
 * @param {string} committeeType - 'party' or 'affiliated'
 * @param {string} constituency - Constituency name (required)
 * @param {string} mandal - Mandal name (required)
 * @param {string} panchayat - Panchayat name (required)
 * @returns {Promise<Array>} - Returns array of person objects
 */
export const getAllPersons = async (
  committeeType,
  constituency,
  mandal,
  panchayat
) => {
  try {
    if (!constituency || !mandal || !panchayat) {
      throw new Error(
        "Constituency, mandal, and panchayat are required for hierarchical structure"
      );
    }

    const constituencyLower = constituency.toLowerCase();
    const mandalLower = mandal.toLowerCase();
    const panchayatLower = panchayat.toLowerCase();

    const personsRef = collection(
      db,
      `constituencies/${constituencyLower}/mandals/${mandalLower}/panchayats/${panchayatLower}/persons`
    );
    const q = query(personsRef, where("committeeType", "==", committeeType));
    const querySnapshot = await getDocs(q);

    const persons = [];
    querySnapshot.forEach((doc) => {
      persons.push({ id: doc.id, ...doc.data() });
    });

    return persons;
  } catch (error) {
    console.error("Error getting persons:", error);
    throw error;
  }
};

/**
 * Get all persons by location (constituency, mandal, panchayat)
 * @param {string} constituency - Constituency name
 * @param {string} mandal - Mandal name
 * @param {string} panchayat - Panchayat name
 * @returns {Promise<Object>} - Returns object with party and affiliated persons
 */
export const getPersonsByLocation = async (constituency, mandal, panchayat) => {
  try {
    if (!constituency || !mandal || !panchayat) {
      throw new Error("Constituency, mandal, and panchayat are required");
    }

    // Convert location parameters to lowercase for querying
    const constituencyLower = constituency.toLowerCase();
    const mandalLower = mandal.toLowerCase();
    const panchayatLower = panchayat.toLowerCase();

    // Get reference to the persons collection for this location
    const personsRef = collection(
      db,
      `constituencies/${constituencyLower}/mandals/${mandalLower}/panchayats/${panchayatLower}/persons`
    );

    const querySnapshot = await getDocs(personsRef);

    const partyPersons = [];
    const affiliatedPersons = [];

    querySnapshot.forEach((doc) => {
      const data = { id: doc.id, ...doc.data() };
      if (data.committeeType === "party") {
        partyPersons.push(data);
      } else if (data.committeeType === "affiliated") {
        affiliatedPersons.push(data);
      }
    });

    // Sort by serialNo
    partyPersons.sort((a, b) => a.serialNo - b.serialNo);
    affiliatedPersons.sort((a, b) => a.serialNo - b.serialNo);

    return {
      party: partyPersons,
      affiliated: affiliatedPersons,
    };
  } catch (error) {
    console.error("Error getting persons by location:", error);
    throw error;
  }
};

/**
 * Update a person's data
 * @param {string} committeeType - 'party' or 'affiliated'
 * @param {number} serialNo - Serial number of the person
 * @param {string} constituency - Constituency name
 * @param {string} mandal - Mandal name
 * @param {string} panchayat - Panchayat name
 * @param {object} updates - Object with fields to update
 * @returns {Promise<void>}
 */
export const updatePerson = async (
  committeeType,
  serialNo,
  constituency,
  mandal,
  panchayat,
  updates
) => {
  try {
    if (!constituency || !mandal || !panchayat) {
      throw new Error("Constituency, mandal, and panchayat are required");
    }

    const docId = `${committeeType}_${serialNo}`;
    const constituencyLower = constituency.toLowerCase();
    const mandalLower = mandal.toLowerCase();
    const panchayatLower = panchayat.toLowerCase();

    const docPath = `constituencies/${constituencyLower}/mandals/${mandalLower}/panchayats/${panchayatLower}/persons/${docId}`;
    const docRef = doc(db, docPath);

    const dataToUpdate = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(docRef, dataToUpdate);
    console.log("Person updated successfully");
  } catch (error) {
    console.error("Error updating person:", error);
    throw error;
  }
};

/**
 * Delete a person and their associated files
 * @param {string} committeeType - 'party' or 'affiliated'
 * @param {number} serialNo - Serial number of the person
 * @param {string} constituency - Constituency name
 * @param {string} mandal - Mandal name
 * @param {string} panchayat - Panchayat name
 * @returns {Promise<void>}
 */
export const deletePerson = async (
  committeeType,
  serialNo,
  constituency,
  mandal,
  panchayat
) => {
  try {
    if (!constituency || !mandal || !panchayat) {
      throw new Error("Constituency, mandal, and panchayat are required");
    }

    const docId = `${committeeType}_${serialNo}`;

    // Get person data first to delete associated files
    const personData = await getPerson(
      committeeType,
      serialNo,
      constituency,
      mandal,
      panchayat
    );

    // Delete photo if exists
    if (personData.photoURL) {
      await deletePhotoByURL(personData.photoURL);
    }

    // Delete documents if exist
    if (personData.documents && personData.documents.length > 0) {
      for (const doc of personData.documents) {
        await deleteDocumentByURL(doc.url);
      }
    }

    // Delete the Firestore document
    const constituencyLower = constituency.toLowerCase();
    const mandalLower = mandal.toLowerCase();
    const panchayatLower = panchayat.toLowerCase();

    const docPath = `constituencies/${constituencyLower}/mandals/${mandalLower}/panchayats/${panchayatLower}/persons/${docId}`;
    const docRef = doc(db, docPath);
    await deleteDoc(docRef);

    console.log("Person deleted successfully");
  } catch (error) {
    console.error("Error deleting person:", error);
    throw error;
  }
};

// ===== PHOTO OPERATIONS =====

/**
 * Upload a photo to Firebase Storage
 * @param {string} committeeType - 'party' or 'affiliated'
 * @param {number} serialNo - Serial number of the person
 * @param {File} photoFile - The photo file to upload
 * @param {Object} locationData - Location information (constituency, mandal, panchayat)
 * @returns {Promise<string>} - Returns the download URL
 */
export const uploadPhoto = async (
  committeeType = "all_committees",
  serialNo,
  photoFile,
  locationData = {}
) => {
  try {
    const timestamp = Date.now();
    const fileName = `${committeeType}_${serialNo}_${timestamp}.${photoFile.name
      .split(".")
      .pop()}`;

    // Create hierarchical path: constituency/mandal/panchayat/photos/committeeType/fileName
    // Ensure lowercase for storage paths
    const constituency = (locationData.constituency || "unknown").toLowerCase();
    const mandal = (locationData.mandal || "unknown").toLowerCase();
    const panchayat = (locationData.panchayat || "unknown").toLowerCase();

    const storagePath = `${constituency}/${mandal}/${panchayat}/photos/${committeeType}/${fileName}`;
    const storageRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(storageRef, photoFile);
    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log("Photo uploaded successfully:", downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading photo:", error);
    throw error;
  }
};

/**
 * Delete a photo from Firebase Storage by URL
 * @param {string} photoURL - The photo URL to delete
 * @returns {Promise<void>}
 */
export const deletePhotoByURL = async (photoURL) => {
  try {
    if (!photoURL) return;

    // Extract the storage path from the download URL
    const storagePath = extractStoragePathFromURL(photoURL);
    const photoRef = ref(storage, storagePath);
    await deleteObject(photoRef);

    console.log("Photo deleted successfully:", storagePath);
  } catch (error) {
    console.error("Error deleting photo:", error);
    // Don't throw error if photo doesn't exist
    if (error.code !== "storage/object-not-found") {
      throw error;
    }
  }
};

/**
 * Update a person's photo
 * @param {string} committeeType - 'party' or 'affiliated'
 * @param {number} serialNo - Serial number of the person
 * @param {string} constituency - Constituency name
 * @param {string} mandal - Mandal name
 * @param {string} panchayat - Panchayat name
 * @param {File} newPhotoFile - The new photo file
 * @returns {Promise<string>} - Returns the new photo URL
 */
export const updatePhoto = async (
  committeeType,
  serialNo,
  constituency,
  mandal,
  panchayat,
  newPhotoFile
) => {
  try {
    if (!constituency || !mandal || !panchayat) {
      throw new Error("Constituency, mandal, and panchayat are required");
    }

    // Get existing person data
    const personData = await getPerson(
      committeeType,
      serialNo,
      constituency,
      mandal,
      panchayat
    );

    // Delete old photo if exists
    if (personData.photoURL) {
      await deletePhotoByURL(personData.photoURL);
    }

    // Prepare location data
    const locationData = {
      constituency: constituency.toLowerCase(),
      mandal: mandal.toLowerCase(),
      panchayat: panchayat.toLowerCase(),
    };

    // Upload new photo
    const newPhotoURL = await uploadPhoto(
      committeeType,
      serialNo,
      newPhotoFile,
      locationData
    );

    // Update person data
    await updatePerson(
      committeeType,
      serialNo,
      constituency,
      mandal,
      panchayat,
      { photoURL: newPhotoURL }
    );

    return newPhotoURL;
  } catch (error) {
    console.error("Error updating photo:", error);
    throw error;
  }
};

// ===== DOCUMENT OPERATIONS =====

/**
 * Upload multiple documents to Firebase Storage
 * @param {string} committeeType - 'party' or 'affiliated'
 * @param {number} serialNo - Serial number of the person
 * @param {Array} documents - Array of document objects with 'file' property
 * @param {Object} locationData - Location information (constituency, mandal, panchayat)
 * @returns {Promise<Array>} - Returns array of document objects with URLs
 */
export const uploadDocuments = async (
  committeeType,
  serialNo,
  documents,
  locationData = {}
) => {
  try {
    // Ensure lowercase for storage paths
    const constituency = (locationData.constituency || "unknown").toLowerCase();
    const mandal = (locationData.mandal || "unknown").toLowerCase();
    const panchayat = (locationData.panchayat || "unknown").toLowerCase();

    const uploadPromises = documents.map(async (doc, index) => {
      const file = doc.file;
      const timestamp = Date.now();
      const fileName = `${committeeType}_${serialNo}_doc${index}_${timestamp}.${file.name
        .split(".")
        .pop()}`;

      // Create hierarchical path: constituency/mandal/panchayat/documents/committeeType/fileName
      const storagePath = `${constituency}/${mandal}/${panchayat}/documents/${committeeType}/${fileName}`;
      const storageRef = ref(storage, storagePath);

      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return {
        name: doc.name,
        type: doc.type,
        url: downloadURL,
      };
    });

    const documentURLs = await Promise.all(uploadPromises);
    console.log("Documents uploaded successfully");
    return documentURLs;
  } catch (error) {
    console.error("Error uploading documents:", error);
    throw error;
  }
};

/**
 * Delete a document from Firebase Storage by URL
 * @param {string} documentURL - The document URL to delete
 * @returns {Promise<void>}
 */
export const deleteDocumentByURL = async (documentURL) => {
  try {
    if (!documentURL) return;

    // Extract the storage path from the download URL
    const storagePath = extractStoragePathFromURL(documentURL);
    const docRef = ref(storage, storagePath);
    await deleteObject(docRef);

    console.log("Document deleted successfully:", storagePath);
  } catch (error) {
    console.error("Error deleting document:", error);
    // Don't throw error if document doesn't exist
    if (error.code !== "storage/object-not-found") {
      throw error;
    }
  }
};

/**
 * Delete a specific document and update person data
 * @param {string} committeeType - 'party' or 'affiliated'
 * @param {number} serialNo - Serial number of the person
 * @param {string} constituency - Constituency name
 * @param {string} mandal - Mandal name
 * @param {string} panchayat - Panchayat name
 * @param {number} docIndex - Index of the document to delete
 * @returns {Promise<void>}
 */
export const deleteDocument = async (
  committeeType,
  serialNo,
  constituency,
  mandal,
  panchayat,
  docIndex
) => {
  try {
    if (!constituency || !mandal || !panchayat) {
      throw new Error("Constituency, mandal, and panchayat are required");
    }

    const personData = await getPerson(
      committeeType,
      serialNo,
      constituency,
      mandal,
      panchayat
    );

    if (personData.documents && personData.documents[docIndex]) {
      const docToDelete = personData.documents[docIndex];
      await deleteDocumentByURL(docToDelete.url);

      // Update person data to remove the document
      const updatedDocuments = personData.documents.filter(
        (_, index) => index !== docIndex
      );
      await updatePerson(
        committeeType,
        serialNo,
        constituency,
        mandal,
        panchayat,
        {
          documents: updatedDocuments,
        }
      );
    }
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};

// ===== BATCH OPERATIONS =====

/**
 * Upload standalone photos (not associated with a person)
 * @param {Array} photoFiles - Array of photo files
 * @param {string} category - Optional category name
 * @param {Object} locationData - Location information (constituency, mandal, panchayat)
 * @returns {Promise<Array>} - Returns array of photo URLs
 */
export const uploadStandalonePhotos = async (
  photoFiles,
  category = "general",
  locationData = {}
) => {
  try {
    // Convert location data to lowercase
    const constituency = (locationData.constituency || "unknown").toLowerCase();
    const mandal = (locationData.mandal || "unknown").toLowerCase();
    const panchayat = (locationData.panchayat || "unknown").toLowerCase();

    const uploadPromises = photoFiles.map(async (file) => {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const fileName = `${category}_${timestamp}_${randomId}.${file.name
        .split(".")
        .pop()}`;

      // Create hierarchical path: constituency/mandal/panchayat/standalone-photos/fileName
      const storagePath = `${constituency}/${mandal}/${panchayat}/standalone-photos/${fileName}`;
      const storageRef = ref(storage, storagePath);

      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return {
        name: file.name,
        url: downloadURL,
        uploadedAt: new Date().toISOString(),
      };
    });

    const photoURLs = await Promise.all(uploadPromises);

    // Save metadata to Firestore with location data (lowercase)
    const batchDoc = {
      category,
      photos: photoURLs,
      constituency,
      mandal,
      panchayat,
      uploadedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = doc(collection(db, "photo-batches"));
    await setDoc(docRef, batchDoc);

    console.log("Standalone photos uploaded successfully");
    return photoURLs;
  } catch (error) {
    console.error("Error uploading standalone photos:", error);
    throw error;
  }
};

/**
 * Get photo batches by location
 * @param {string} constituency - Constituency name
 * @param {string} mandal - Mandal name
 * @param {string} panchayat - Panchayat name
 * @returns {Promise<Array>} - Returns array of photo batch objects
 */
export const getPhotoBatchesByLocation = async (
  constituency,
  mandal,
  panchayat
) => {
  try {
    // Convert location parameters to lowercase for querying
    const constituencyLower = constituency?.toLowerCase();
    const mandalLower = mandal?.toLowerCase();
    const panchayatLower = panchayat?.toLowerCase();

    const batchesRef = collection(db, "photo-batches");
    const q = query(
      batchesRef,
      where("constituency", "==", constituencyLower),
      where("mandal", "==", mandalLower),
      where("panchayat", "==", panchayatLower)
    );

    const querySnapshot = await getDocs(q);

    const batches = [];
    querySnapshot.forEach((doc) => {
      batches.push({ id: doc.id, ...doc.data() });
    });

    // Sort by upload time (newest first)
    batches.sort((a, b) => {
      const timeA = a.uploadedAt?.toDate?.() || new Date(0);
      const timeB = b.uploadedAt?.toDate?.() || new Date(0);
      return timeB - timeA;
    });

    return batches;
  } catch (error) {
    console.error("Error getting photo batches by location:", error);
    throw error;
  }
};

/**
 * Delete a photo from a batch
 * @param {string} batchId - The batch document ID
 * @param {string} photoUrl - The photo URL to delete
 * @returns {Promise<void>}
 */
export const deletePhotoFromBatch = async (batchId, photoUrl) => {
  try {
    // Get the batch document
    const batchRef = doc(db, "photo-batches", batchId);
    const batchDoc = await getDoc(batchRef);

    if (!batchDoc.exists()) {
      throw new Error("Batch not found");
    }

    const batchData = batchDoc.data();
    const updatedPhotos = batchData.photos.filter(
      (photo) => photo.url !== photoUrl
    );

    // If no photos left, delete the entire batch
    if (updatedPhotos.length === 0) {
      await deleteDoc(batchRef);
      console.log("Batch deleted (no photos remaining)");
    } else {
      // Update the batch with remaining photos
      await updateDoc(batchRef, {
        photos: updatedPhotos,
        updatedAt: serverTimestamp(),
      });
      console.log("Photo removed from batch");
    }

    // Delete the photo file from Storage
    await deletePhotoByURL(photoUrl);

    console.log("Photo deleted successfully");
  } catch (error) {
    console.error("Error deleting photo from batch:", error);
    throw error;
  }
};
