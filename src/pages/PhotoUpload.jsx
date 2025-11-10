import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  IconButton,
  Card,
  CardMedia,
  CardActions,
  Alert,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import TranslateIcon from "@mui/icons-material/Translate";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import {
  savePerson,
  saveMultiplePersons,
  deletePerson,
  updatePerson,
  updatePhoto,
  deleteDocument,
  uploadStandalonePhotos,
  getPersonsByLocation,
  getPhotoBatchesByLocation,
  deletePhotoFromBatch,
} from "../firebase/api";
import {
  getConstituencies,
  getMandalsForConstituency,
  getPanchayatsForMandal,
} from "../constants/locations";

const translations = {
  en: {
    title: "Photo Upload",
    takePhoto: "Take Photo",
    takePhotoDesc: "Use your camera to capture a photo",
    uploadPhotos: "Upload Photos",
    uploadPhotosDesc: "Select single or multiple photos from device",
    selectedPhotos: "Selected Photos",
    clearAll: "Clear All",
    uploadAll: "Upload All",
    noPhotosSelected:
      "No photos selected yet. Click the upload area above to select photos.",
    filesSkipped: "Some files were skipped because they are not images",
    selectAtLeastOne: "Please select at least one photo to upload",
    uploadSuccess: "Successfully prepared {count} photo(s) for upload!",
    // New translations for Person Data Upload
    tabPhotoUpload: "Photo Upload",
    tabPersonData: "Person Data Upload",
    committeeType: "Committee Type",
    partyCommittee: "Party Committee",
    affiliatedCommittees: "Affiliated Committees",
    serialNo: "S.No",
    personName: "Person Name",
    voterId: "Voter ID",
    photo: "Photo",
    documents: "Documents",
    actions: "Actions",
    addRow: "Add Person",
    uploadPhoto: "Upload Photo",
    uploadDocument: "Upload Document",
    uploaded: "Uploaded",
    notUploaded: "Not Uploaded",
    saveData: "Save All Data",
    noPersonsAdded: "No persons added yet. Click 'Add Person' to start.",
    // Delete confirmation dialog
    deleteConfirmTitle: "Confirm Delete",
    deletePersonMessage:
      "Are you sure you want to delete this person? This action cannot be undone.",
    deletePhotoMessage: "Are you sure you want to delete this photo?",
    deleteDocumentMessage: "Are you sure you want to delete this document?",
    cancel: "Cancel",
    delete: "Delete",
    // Location selection
    constituency: "Constituency",
    mandal: "Mandal",
    panchayat: "Panchayat",
    selectConstituency: "Select Constituency",
    selectMandal: "Select Mandal",
    selectPanchayat: "Select Panchayat",
    selectLocationFirst:
      "Please select Constituency, Mandal, and Panchayat to continue",
    loadingData: "Loading existing data...",
    uploadedPhotosList: "Uploaded Photos",
    noUploadedPhotos: "No photos uploaded yet for this location.",
    photoUploadedOn: "Uploaded:",
    photoUpdatedOn: "Updated:",
    createdAt: "Created",
    updatedAt: "Last Updated",
  },
  te: {
    title: "ఫోటో అప్‌లోడ్",
    takePhoto: "ఫోటో తీయండి",
    takePhotoDesc: "మీ కెమెరాను ఉపయోగించి ఫోటో తీయండి",
    uploadPhotos: "ఫోటోలు అప్‌లోడ్ చేయండి",
    uploadPhotosDesc: "పరికరం నుండి ఒకటి లేదా అనేక ఫోటోలను ఎంచుకోండి",
    selectedPhotos: "ఎంచుకున్న ఫోటోలు",
    clearAll: "అన్నీ తొలగించు",
    uploadAll: "అన్నీ అప్‌లోడ్ చేయి",
    noPhotosSelected:
      "ఇంకా ఫోటోలు ఎంచుకోలేదు. ఫోటోలను ఎంచుకోవడానికి పైన ఉన్న అప్‌లోడ్ ప్రాంతాన్ని క్లిక్ చేయండి.",
    filesSkipped: "కొన్ని ఫైల్‌లు చిత్రాలు కానందున వదిలివేయబడ్డాయి",
    selectAtLeastOne: "దయచేసి అప్‌లోడ్ చేయడానికి కనీసం ఒక ఫోటోను ఎంచుకోండి",
    uploadSuccess:
      "{count} ఫోటో(లు) అప్‌లోడ్ కోసం విజయవంతంగా సిద్ధం చేయబడింది!",
    // New translations for Person Data Upload
    tabPhotoUpload: "ఫోటో అప్‌లోడ్",
    tabPersonData: "వ్యక్తి డేటా అప్‌లోడ్",
    committeeType: "కమిటీ రకం",
    partyCommittee: "పార్టీ కమిటీ",
    affiliatedCommittees: "అనుబంధ కమిటీలు",
    serialNo: "క్రమ సంఖ్య",
    personName: "వ్యక్తి పేరు",
    voterId: "ఓటరు ID",
    photo: "ఫోటో",
    documents: "పత్రాలు",
    actions: "చర్యలు",
    addRow: "వ్యక్తిని జోడించు",
    uploadPhoto: "ఫోటో అప్‌లోడ్ చేయి",
    uploadDocument: "పత్రం అప్‌లోడ్ చేయి",
    uploaded: "అప్‌లోడ్ చేయబడింది",
    notUploaded: "అప్‌లోడ్ చేయలేదు",
    saveData: "మొత్తం డేటాను సేవ్ చేయి",
    noPersonsAdded:
      "ఇంకా వ్యక్తులు జోడించబడలేదు. ప్రారంభించడానికి 'వ్యక్తిని జోడించు' క్లిక్ చేయండి.",
    // Delete confirmation dialog
    deleteConfirmTitle: "తొలగింపును నిర్ధారించండి",
    deletePersonMessage:
      "మీరు ఖచ్చితంగా ఈ వ్యక్తిని తొలగించాలనుకుంటున్నారా? ఈ చర్యను రద్దు చేయలేము.",
    deletePhotoMessage: "మీరు ఖచ్చితంగా ఈ ఫోటోను తొలగించాలనుకుంటున్నారా?",
    deleteDocumentMessage: "మీరు ఖచ్చితంగా ఈ పత్రాన్ని తొలగించాలనుకుంటున్నారా?",
    cancel: "రద్దు చేయి",
    delete: "తొలగించు",
    // Location selection
    constituency: "నియోజకవర్గం",
    mandal: "మండలం",
    panchayat: "పంచాయతీ",
    selectConstituency: "నియోజకవర్గం ఎంచుకోండి",
    selectMandal: "మండలం ఎంచుకోండి",
    selectPanchayat: "పంచాయతీ ఎంచుకోండి",
    selectLocationFirst:
      "కొనసాగించడానికి దయచేసి నియోజకవర్గం, మండలం మరియు పంచాయతీని ఎంచుకోండి",
    loadingData: "ఇప్పటికే ఉన్న డేటాను లోడ్ చేస్తోంది...",
    uploadedPhotosList: "అప్‌లోడ్ చేసిన ఫోటోలు",
    noUploadedPhotos: "ఈ ప్రదేశానికి ఇంకా ఫోటోలు అప్‌లోడ్ చేయలేదు.",
    photoUploadedOn: "అప్‌లోడ్ చేసినది:",
    photoUpdatedOn: "నవీకరించినది:",
    createdAt: "సృష్టించబడింది",
    updatedAt: "చివరి నవీకరణ",
  },
};

// Helper function to create default persons
const createDefaultPersons = (count, startSerialNo = 1) => {
  return Array.from({ length: count }, (_, index) => ({
    serialNo: startSerialNo + index,
    name: "",
    voterId: "",
    photo: null,
    photoPreview: null,
    documents: [],
    isDefault: true, // Flag to identify default rows
  }));
};

export default function PhotoUpload() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [language, setLanguage] = useState("en");
  const [currentTab, setCurrentTab] = useState(0);

  // Location selection states
  const [selectedConstituency, setSelectedConstituency] = useState("Pileru");
  const [selectedMandal, setSelectedMandal] = useState("");
  const [selectedPanchayat, setSelectedPanchayat] = useState("");
  const [availableMandals, setAvailableMandals] = useState(
    getMandalsForConstituency("Pileru")
  );
  const [availablePanchayats, setAvailablePanchayats] = useState([]);

  // Person Data Upload states - separate for each committee type
  // Initialize with default rows: 15 for party, 9 for affiliated
  const [partyPersons, setPartyPersons] = useState(() =>
    createDefaultPersons(15, 1)
  );
  const [partyNextSerialNo, setPartyNextSerialNo] = useState(16);
  const [affiliatedPersons, setAffiliatedPersons] = useState(() =>
    createDefaultPersons(9, 1)
  );
  const [affiliatedNextSerialNo, setAffiliatedNextSerialNo] = useState(10);

  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    type: "", // "person", "photo", "document"
    data: null, // { type: "party"/"affiliated", serialNo, docIndex }
  });

  // Preview dialog state
  const [previewDialog, setPreviewDialog] = useState({
    open: false,
    type: "", // "image" or "pdf"
    url: "",
    name: "",
  });

  // Loading state for Firebase operations
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Uploaded photos from Firebase
  const [uploadedPhotos, setUploadedPhotos] = useState([]);

  const t = translations[language];

  // Load existing data when location is fully selected
  useEffect(() => {
    const loadExistingData = async () => {
      if (selectedConstituency && selectedMandal && selectedPanchayat) {
        try {
          setLoadingData(true);

          // Fetch persons data
          const personsData = await getPersonsByLocation(
            selectedConstituency,
            selectedMandal,
            selectedPanchayat
          );

          // Convert Firebase data to local state format
          const convertPersonData = (person) => ({
            serialNo: person.serialNo,
            name: person.name || "",
            voterId: person.voterId || "",
            photo: null, // File object not available from Firebase
            photoPreview: person.photoURL || null, // Use Firebase URL as preview
            photoURL: person.photoURL || null, // Keep the original URL for re-saving
            documents:
              person.documents?.map((doc) => ({
                file: null, // File object not available
                name: doc.name,
                type: doc.type,
                preview: doc.type.startsWith("image/") ? doc.url : null,
                url: doc.url, // Store the URL for display
              })) || [],
            isDefault:
              person.isDefault !== undefined ? person.isDefault : false,
            createdAt: person.createdAt,
            updatedAt: person.updatedAt,
          });

          // Set party persons or keep defaults if no data
          if (personsData.party.length > 0) {
            setPartyPersons(personsData.party.map(convertPersonData));
            const maxSerialNo = Math.max(
              ...personsData.party.map((p) => p.serialNo)
            );
            setPartyNextSerialNo(maxSerialNo + 1);
          }

          // Set affiliated persons or keep defaults if no data
          if (personsData.affiliated.length > 0) {
            setAffiliatedPersons(personsData.affiliated.map(convertPersonData));
            const maxSerialNo = Math.max(
              ...personsData.affiliated.map((p) => p.serialNo)
            );
            setAffiliatedNextSerialNo(maxSerialNo + 1);
          }

          // Fetch uploaded photo batches
          const photoBatches = await getPhotoBatchesByLocation(
            selectedConstituency,
            selectedMandal,
            selectedPanchayat
          );

          // Flatten all photos from batches into a single array
          const allPhotos = photoBatches.flatMap((batch) =>
            batch.photos.map((photo) => ({
              ...photo,
              batchId: batch.id,
              uploadedAt: batch.uploadedAt,
              updatedAt: batch.updatedAt || batch.uploadedAt,
            }))
          );

          setUploadedPhotos(allPhotos);

          console.log("Loaded existing data for location");
        } catch (error) {
          console.error("Error loading existing data:", error);
          // Don't show error to user, just log it
          // If there's no data, that's fine - we start fresh
        } finally {
          setLoadingData(false);
        }
      } else {
        // Clear uploaded photos when location is not fully selected
        setUploadedPhotos([]);
      }
    };

    loadExistingData();
  }, [selectedConstituency, selectedMandal, selectedPanchayat]);

  const handleLanguageChange = (event, newLanguage) => {
    if (newLanguage !== null) {
      setLanguage(newLanguage);
    }
  };

  // Location selection handlers
  const handleConstituencyChange = (event) => {
    const constituency = event.target.value;
    setSelectedConstituency(constituency);
    setSelectedMandal("");
    setSelectedPanchayat("");
    setAvailablePanchayats([]);
    if (constituency) {
      setAvailableMandals(getMandalsForConstituency(constituency));
    } else {
      setAvailableMandals([]);
    }
  };

  const handleMandalChange = (event) => {
    const mandal = event.target.value;
    setSelectedMandal(mandal);
    setSelectedPanchayat("");
    if (mandal && selectedConstituency) {
      setAvailablePanchayats(
        getPanchayatsForMandal(selectedConstituency, mandal)
      );
    } else {
      setAvailablePanchayats([]);
    }
  };

  const handlePanchayatChange = (event) => {
    setSelectedPanchayat(event.target.value);
  };

  // Check if all locations are selected
  const areLocationsSelected =
    selectedConstituency && selectedMandal && selectedPanchayat;

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);

    if (files.length === 0) return;

    // Filter only image files
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length !== files.length) {
      alert(t.filesSkipped);
    }

    // Add new files to existing ones
    setSelectedFiles((prev) => [...prev, ...imageFiles]);

    // Create preview URLs
    const newPreviews = imageFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / 1024).toFixed(2) + " KB",
    }));

    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveFile = (index) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previews[index].url);

    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    // Revoke all object URLs
    previews.forEach((preview) => URL.revokeObjectURL(preview.url));

    setSelectedFiles([]);
    setPreviews([]);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert(t.selectAtLeastOne);
      return;
    }

    try {
      setLoading(true);

      // Include location data in upload
      const locationData = {
        constituency: selectedConstituency,
        mandal: selectedMandal,
        panchayat: selectedPanchayat,
      };

      const newPhotos = await uploadStandalonePhotos(
        selectedFiles,
        "photo-upload",
        locationData
      );
      console.log("Uploaded photos:", newPhotos);
      alert(t.uploadSuccess.replace("{count}", selectedFiles.length));

      // Clear the selection after successful upload
      handleClearAll();

      // Reload uploaded photos list
      const photoBatches = await getPhotoBatchesByLocation(
        selectedConstituency,
        selectedMandal,
        selectedPanchayat
      );
      const allPhotos = photoBatches.flatMap((batch) =>
        batch.photos.map((photo) => ({
          ...photo,
          batchId: batch.id,
          uploadedAt: batch.uploadedAt,
          updatedAt: batch.updatedAt || batch.uploadedAt,
        }))
      );
      setUploadedPhotos(allPhotos);

      setLoading(false);
    } catch (error) {
      console.error("Error uploading photos:", error);
      alert(`Error uploading photos: ${error.message}`);
      setLoading(false);
    }
  };

  // Person Data Upload handlers
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleAddPerson = (type) => {
    if (type === "party") {
      const newPerson = {
        serialNo: partyNextSerialNo,
        name: "",
        voterId: "",
        photo: null,
        photoPreview: null,
        documents: [],
        isDefault: false, // User-added rows are not default
      };
      setPartyPersons([...partyPersons, newPerson]);
      setPartyNextSerialNo(partyNextSerialNo + 1);
    } else {
      const newPerson = {
        serialNo: affiliatedNextSerialNo,
        name: "",
        voterId: "",
        photo: null,
        photoPreview: null,
        documents: [],
        isDefault: false, // User-added rows are not default
      };
      setAffiliatedPersons([...affiliatedPersons, newPerson]);
      setAffiliatedNextSerialNo(affiliatedNextSerialNo + 1);
    }
  };

  const handlePersonFieldChange = (type, serialNo, field, value) => {
    if (type === "party") {
      setPartyPersons(
        partyPersons.map((person) =>
          person.serialNo === serialNo ? { ...person, [field]: value } : person
        )
      );
    } else {
      setAffiliatedPersons(
        affiliatedPersons.map((person) =>
          person.serialNo === serialNo ? { ...person, [field]: value } : person
        )
      );
    }
  };

  const handlePersonPhotoUpload = (type, serialNo, event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const preview = URL.createObjectURL(file);
      if (type === "party") {
        setPartyPersons(
          partyPersons.map((person) =>
            person.serialNo === serialNo
              ? { ...person, photo: file, photoPreview: preview }
              : person
          )
        );
      } else {
        setAffiliatedPersons(
          affiliatedPersons.map((person) =>
            person.serialNo === serialNo
              ? { ...person, photo: file, photoPreview: preview }
              : person
          )
        );
      }
    }
  };

  const handlePersonDocumentUpload = (type, serialNo, event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(
      (file) =>
        file.type.startsWith("image/") || file.type === "application/pdf"
    );

    // Create document objects with preview URLs
    const documentsWithPreviews = validFiles.map((file) => ({
      file,
      name: file.name,
      type: file.type,
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
    }));

    if (type === "party") {
      setPartyPersons(
        partyPersons.map((person) =>
          person.serialNo === serialNo
            ? {
                ...person,
                documents: [...person.documents, ...documentsWithPreviews],
              }
            : person
        )
      );
    } else {
      setAffiliatedPersons(
        affiliatedPersons.map((person) =>
          person.serialNo === serialNo
            ? {
                ...person,
                documents: [...person.documents, ...documentsWithPreviews],
              }
            : person
        )
      );
    }
  };

  const handleRemovePersonPhoto = (type, serialNo) => {
    setDeleteDialog({
      open: true,
      type: "photo",
      data: { type, serialNo },
    });
  };

  const confirmRemovePersonPhoto = async () => {
    const { type, serialNo } = deleteDialog.data;

    try {
      // Update Firebase if location is selected and person might be saved
      if (selectedConstituency && selectedMandal && selectedPanchayat) {
        try {
          // Get the person to check if they have a photoURL in Firebase
          const persons = type === "party" ? partyPersons : affiliatedPersons;
          const person = persons.find((p) => p.serialNo === serialNo);

          if (person?.photoURL && !person.photoURL.startsWith("blob:")) {
            // Person has a Firebase photo URL - delete it from Storage and update Firestore
            await updatePerson(
              type,
              serialNo,
              selectedConstituency,
              selectedMandal,
              selectedPanchayat,
              { photoURL: null }
            );
            console.log("Photo removed from Firebase successfully");
          }
        } catch (firebaseError) {
          console.log("Error removing photo from Firebase:", firebaseError);
        }
      }

      // Update local state
      if (type === "party") {
        setPartyPersons(
          partyPersons.map((person) => {
            if (person.serialNo === serialNo && person.photoPreview) {
              // Only revoke object URLs (local blobs), not Firebase URLs
              if (person.photoPreview.startsWith("blob:")) {
                URL.revokeObjectURL(person.photoPreview);
              }
              return {
                ...person,
                photo: null,
                photoPreview: null,
                photoURL: null,
              };
            }
            return person;
          })
        );
      } else {
        setAffiliatedPersons(
          affiliatedPersons.map((person) => {
            if (person.serialNo === serialNo && person.photoPreview) {
              // Only revoke object URLs (local blobs), not Firebase URLs
              if (person.photoPreview.startsWith("blob:")) {
                URL.revokeObjectURL(person.photoPreview);
              }
              return {
                ...person,
                photo: null,
                photoPreview: null,
                photoURL: null,
              };
            }
            return person;
          })
        );
      }

      setDeleteDialog({ open: false, type: "", data: null });
    } catch (error) {
      console.error("Error removing person photo:", error);
      alert(`Error removing photo: ${error.message}`);
    }
  };

  const handleRemoveDocument = (type, serialNo, docIndex) => {
    setDeleteDialog({
      open: true,
      type: "document",
      data: { type, serialNo, docIndex },
    });
  };

  const confirmRemoveDocument = async () => {
    const { type, serialNo, docIndex } = deleteDialog.data;

    try {
      // Delete from Firebase if location is selected and document exists in Firebase
      if (selectedConstituency && selectedMandal && selectedPanchayat) {
        try {
          // Get the person to check if document has a Firebase URL
          const persons = type === "party" ? partyPersons : affiliatedPersons;
          const person = persons.find((p) => p.serialNo === serialNo);
          const document = person?.documents[docIndex];

          if (document?.url && !document.url.startsWith("blob:")) {
            // Document has a Firebase URL - delete it from Storage and Firestore
            await deleteDocument(
              type,
              serialNo,
              selectedConstituency,
              selectedMandal,
              selectedPanchayat,
              docIndex
            );
            console.log("Document deleted from Firebase successfully");
          }
        } catch (firebaseError) {
          console.log("Error deleting document from Firebase:", firebaseError);
        }
      }

      // Update local state
      if (type === "party") {
        setPartyPersons(
          partyPersons.map((person) => {
            if (person.serialNo === serialNo) {
              const doc = person.documents[docIndex];
              // Only revoke object URLs (local blobs), not Firebase URLs
              if (doc.preview && doc.preview.startsWith("blob:")) {
                URL.revokeObjectURL(doc.preview);
              }
              return {
                ...person,
                documents: person.documents.filter(
                  (_, index) => index !== docIndex
                ),
              };
            }
            return person;
          })
        );
      } else {
        setAffiliatedPersons(
          affiliatedPersons.map((person) => {
            if (person.serialNo === serialNo) {
              const doc = person.documents[docIndex];
              // Only revoke object URLs (local blobs), not Firebase URLs
              if (doc.preview && doc.preview.startsWith("blob:")) {
                URL.revokeObjectURL(doc.preview);
              }
              return {
                ...person,
                documents: person.documents.filter(
                  (_, index) => index !== docIndex
                ),
              };
            }
            return person;
          })
        );
      }

      setDeleteDialog({ open: false, type: "", data: null });
    } catch (error) {
      console.error("Error removing document:", error);
      alert(`Error removing document: ${error.message}`);
    }
  };

  const handleRemovePerson = (type, serialNo) => {
    setDeleteDialog({
      open: true,
      type: "person",
      data: { type, serialNo },
    });
  };

  const confirmRemovePerson = async () => {
    const { type, serialNo } = deleteDialog.data;

    try {
      // Delete from Firebase if person was previously saved
      // Note: This will only delete if the person exists in Firebase
      if (selectedConstituency && selectedMandal && selectedPanchayat) {
        try {
          await deletePerson(
            type,
            serialNo,
            selectedConstituency,
            selectedMandal,
            selectedPanchayat
          );
          console.log("Person deleted from Firebase successfully");
        } catch (firebaseError) {
          // Person might not exist in Firebase yet (only in local state)
          console.log(
            "Person not found in Firebase (may be unsaved):",
            firebaseError
          );
        }
      } else {
        console.log("Location not selected - skipping Firebase deletion");
      }

      // Delete from local state
      if (type === "party") {
        const person = partyPersons.find((p) => p.serialNo === serialNo);
        if (person?.photoPreview && person.photoPreview.startsWith("blob:")) {
          URL.revokeObjectURL(person.photoPreview);
        }
        // Revoke document preview URLs (local blobs only)
        person?.documents?.forEach((doc) => {
          if (doc.preview && doc.preview.startsWith("blob:")) {
            URL.revokeObjectURL(doc.preview);
          }
        });
        setPartyPersons(
          partyPersons.filter((person) => person.serialNo !== serialNo)
        );
      } else {
        const person = affiliatedPersons.find((p) => p.serialNo === serialNo);
        if (person?.photoPreview && person.photoPreview.startsWith("blob:")) {
          URL.revokeObjectURL(person.photoPreview);
        }
        // Revoke document preview URLs (local blobs only)
        person?.documents?.forEach((doc) => {
          if (doc.preview && doc.preview.startsWith("blob:")) {
            URL.revokeObjectURL(doc.preview);
          }
        });
        setAffiliatedPersons(
          affiliatedPersons.filter((person) => person.serialNo !== serialNo)
        );
      }

      setDeleteDialog({ open: false, type: "", data: null });
      alert("Person deleted successfully!");
    } catch (error) {
      console.error("Error deleting person:", error);
      alert(`Error deleting person: ${error.message}`);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialog({ open: false, type: "", data: null });
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.type === "person") {
      confirmRemovePerson();
    } else if (deleteDialog.type === "photo") {
      confirmRemovePersonPhoto();
    } else if (deleteDialog.type === "document") {
      confirmRemoveDocument();
    } else if (deleteDialog.type === "uploaded-photo") {
      confirmDeleteUploadedPhoto();
    }
  };

  const handleSaveAllData = async () => {
    try {
      setLoading(true);

      // Add location data to each person
      const locationData = {
        constituency: selectedConstituency,
        mandal: selectedMandal,
        panchayat: selectedPanchayat,
      };

      // Save party committee persons
      if (partyPersons.length > 0) {
        const partyPersonsWithLocation = partyPersons.map((person) => ({
          ...person,
          ...locationData,
        }));
        await saveMultiplePersons("party", partyPersonsWithLocation);
      }

      // Save affiliated committee persons
      if (affiliatedPersons.length > 0) {
        const affiliatedPersonsWithLocation = affiliatedPersons.map(
          (person) => ({
            ...person,
            ...locationData,
          })
        );
        await saveMultiplePersons("affiliated", affiliatedPersonsWithLocation);
      }

      alert("All data saved successfully to Firebase!");
      setLoading(false);
    } catch (error) {
      console.error("Error saving data:", error);
      alert(`Error saving data: ${error.message}`);
      setLoading(false);
    }
  };

  const handleSaveCommitteeData = async (type) => {
    try {
      setLoading(true);

      const persons = type === "party" ? partyPersons : affiliatedPersons;

      if (persons.length === 0) {
        alert("No data to save!");
        setLoading(false);
        return;
      }

      // Add location data to each person
      const locationData = {
        constituency: selectedConstituency,
        mandal: selectedMandal,
        panchayat: selectedPanchayat,
      };

      const personsWithLocation = persons.map((person) => ({
        ...person,
        ...locationData,
      }));

      await saveMultiplePersons(type, personsWithLocation);
      alert(
        `${
          type === "party" ? "Party" : "Affiliated"
        } committee data saved successfully to Firebase!`
      );
      setLoading(false);
    } catch (error) {
      console.error("Error saving committee data:", error);
      alert(`Error saving data: ${error.message}`);
      setLoading(false);
    }
  };

  // Preview handlers
  const handlePreviewPhoto = (photoUrl, name) => {
    setPreviewDialog({
      open: true,
      type: "image",
      url: photoUrl,
      name: name || "Photo",
    });
  };

  const handlePreviewDocument = (doc) => {
    const type = doc.type.startsWith("image/") ? "image" : "pdf";
    const url = type === "image" ? doc.preview : URL.createObjectURL(doc.file);
    setPreviewDialog({
      open: true,
      type,
      url,
      name: doc.name,
    });
  };

  const handleClosePreview = () => {
    setPreviewDialog({
      open: false,
      type: "",
      url: "",
      name: "",
    });
  };

  // Handler for deleting uploaded photos
  const handleDeleteUploadedPhoto = (batchId, photoUrl, photoName) => {
    setDeleteDialog({
      open: true,
      type: "uploaded-photo",
      data: { batchId, photoUrl, photoName },
    });
  };

  const confirmDeleteUploadedPhoto = async () => {
    const { batchId, photoUrl } = deleteDialog.data;
    try {
      setLoading(true);
      await deletePhotoFromBatch(batchId, photoUrl);

      // Reload uploaded photos list
      const photoBatches = await getPhotoBatchesByLocation(
        selectedConstituency,
        selectedMandal,
        selectedPanchayat
      );
      const allPhotos = photoBatches.flatMap((batch) =>
        batch.photos.map((photo) => ({
          ...photo,
          batchId: batch.id,
          uploadedAt: batch.uploadedAt,
          updatedAt: batch.updatedAt || batch.uploadedAt,
        }))
      );
      setUploadedPhotos(allPhotos);

      setDeleteDialog({ open: false, type: "", data: null });
      alert("Photo deleted successfully!");
      setLoading(false);
    } catch (error) {
      console.error("Error deleting uploaded photo:", error);
      alert(`Error deleting photo: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {t.title}
        </Typography>
        <ToggleButtonGroup
          value={language}
          exclusive
          onChange={handleLanguageChange}
          size="small"
          color="primary"
        >
          <ToggleButton value="en">English</ToggleButton>
          <ToggleButton value="te">తెలుగు</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* Location Selection Dropdowns */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          backgroundColor: "background.paper",
          borderRadius: 2,
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth required>
              <InputLabel>{t.constituency}</InputLabel>
              <Select
                value={selectedConstituency}
                onChange={handleConstituencyChange}
                label={t.constituency}
              >
                <MenuItem value="">
                  <em>{t.selectConstituency}</em>
                </MenuItem>
                {getConstituencies().map((constituency) => (
                  <MenuItem key={constituency} value={constituency}>
                    {constituency}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth required disabled={!selectedConstituency}>
              <InputLabel>{t.mandal}</InputLabel>
              <Select
                value={selectedMandal}
                onChange={handleMandalChange}
                label={t.mandal}
              >
                <MenuItem value="">
                  <em>{t.selectMandal}</em>
                </MenuItem>
                {availableMandals.map((mandal) => (
                  <MenuItem key={mandal} value={mandal}>
                    {mandal}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth required disabled={!selectedMandal}>
              <InputLabel>{t.panchayat}</InputLabel>
              <Select
                value={selectedPanchayat}
                onChange={handlePanchayatChange}
                label={t.panchayat}
              >
                <MenuItem value="">
                  <em>{t.selectPanchayat}</em>
                </MenuItem>
                {availablePanchayats.map((panchayat) => (
                  <MenuItem key={panchayat} value={panchayat}>
                    {panchayat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {!areLocationsSelected && (
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 1 }}>
                {t.selectLocationFirst}
              </Alert>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Only show tabs and content if all locations are selected */}
      {areLocationsSelected && (
        <>
          {loadingData ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 5,
              }}
            >
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>{t.loadingData}</Typography>
            </Box>
          ) : (
            <>
              <Tabs
                value={currentTab}
                onChange={handleTabChange}
                sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
              >
                <Tab label={t.tabPhotoUpload} />
                <Tab label={t.tabPersonData} />
              </Tabs>

              {/* Tab 1: Simple Photo Upload */}
              {currentTab === 0 && (
                <Box>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {/* Camera Capture Option */}
                    <Grid item xs={12} md={6}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 4,
                          height: "100%",
                          border: "2px dashed",
                          borderColor: "success.main",
                          backgroundColor: "background.default",
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor: "action.hover",
                            borderColor: "success.dark",
                          },
                        }}
                      >
                        <input
                          accept="image/*"
                          capture="environment"
                          style={{ display: "none" }}
                          id="camera-capture-input"
                          type="file"
                          onChange={handleFileSelect}
                        />
                        <label
                          htmlFor="camera-capture-input"
                          style={{ cursor: "pointer", display: "block" }}
                        >
                          <CameraAltIcon
                            sx={{ fontSize: 64, color: "success.main", mb: 2 }}
                          />
                          <Typography variant="h6" gutterBottom>
                            {t.takePhoto}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t.takePhotoDesc}
                          </Typography>
                        </label>
                      </Paper>
                    </Grid>

                    {/* File Upload Option */}
                    <Grid item xs={12} md={6}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 4,
                          height: "100%",
                          border: "2px dashed",
                          borderColor: "primary.main",
                          backgroundColor: "background.default",
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor: "action.hover",
                            borderColor: "primary.dark",
                          },
                        }}
                      >
                        <input
                          accept="image/*"
                          style={{ display: "none" }}
                          id="photo-upload-input"
                          multiple
                          type="file"
                          onChange={handleFileSelect}
                        />
                        <label
                          htmlFor="photo-upload-input"
                          style={{ cursor: "pointer", display: "block" }}
                        >
                          <AddPhotoAlternateIcon
                            sx={{ fontSize: 64, color: "primary.main", mb: 2 }}
                          />
                          <Typography variant="h6" gutterBottom>
                            {t.uploadPhotos}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t.uploadPhotosDesc}
                          </Typography>
                        </label>
                      </Paper>
                    </Grid>
                  </Grid>

                  {previews.length > 0 && (
                    <>
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{ mb: 2 }}
                        alignItems="center"
                      >
                        <Typography variant="h6">
                          {t.selectedPhotos} ({previews.length})
                        </Typography>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={handleClearAll}
                        >
                          {t.clearAll}
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={<CloudUploadIcon />}
                          onClick={handleUpload}
                          disabled={loading}
                        >
                          {loading ? "Uploading..." : t.uploadAll}
                        </Button>
                      </Stack>

                      <Grid container spacing={2}>
                        {previews.map((preview, index) => (
                          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                            <Card elevation={2}>
                              <CardMedia
                                component="img"
                                height="200"
                                image={preview.url}
                                alt={preview.name}
                                sx={{ objectFit: "cover" }}
                              />
                              <CardActions
                                sx={{ justifyContent: "space-between", px: 2 }}
                              >
                                <Box sx={{ overflow: "hidden" }}>
                                  <Typography
                                    variant="body2"
                                    noWrap
                                    title={preview.name}
                                  >
                                    {preview.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {preview.size}
                                  </Typography>
                                </Box>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveFile(index)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </CardActions>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </>
                  )}

                  {previews.length === 0 && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      {t.noPhotosSelected}
                    </Alert>
                  )}

                  {/* Uploaded Photos from Firebase */}
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      {t.uploadedPhotosList} ({uploadedPhotos.length})
                    </Typography>

                    {uploadedPhotos.length > 0 ? (
                      <Grid container spacing={2}>
                        {uploadedPhotos.map((photo, index) => (
                          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                            <Card elevation={2}>
                              <CardMedia
                                component="img"
                                height="200"
                                image={photo.url}
                                alt={photo.name}
                                sx={{
                                  objectFit: "cover",
                                  cursor: "pointer",
                                  "&:hover": { opacity: 0.8 },
                                }}
                                onClick={() =>
                                  handlePreviewPhoto(photo.url, photo.name)
                                }
                              />
                              <CardActions
                                sx={{ justifyContent: "space-between", px: 2 }}
                              >
                                <Box sx={{ overflow: "hidden", flexGrow: 1 }}>
                                  <Typography
                                    variant="body2"
                                    noWrap
                                    title={photo.name}
                                  >
                                    {photo.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                  >
                                    {t.photoUploadedOn}{" "}
                                    {new Date(
                                      photo.uploadedAt
                                    ).toLocaleDateString()}{" "}
                                    {new Date(
                                      photo.uploadedAt
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </Typography>
                                  {photo.updatedAt &&
                                    photo.updatedAt !== photo.uploadedAt && (
                                      <Typography
                                        variant="caption"
                                        color="warning.main"
                                        display="block"
                                      >
                                        {t.photoUpdatedOn}{" "}
                                        {new Date(
                                          photo.updatedAt
                                        ).toLocaleDateString()}{" "}
                                        {new Date(
                                          photo.updatedAt
                                        ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </Typography>
                                    )}
                                </Box>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() =>
                                    handleDeleteUploadedPhoto(
                                      photo.batchId,
                                      photo.url,
                                      photo.name
                                    )
                                  }
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </CardActions>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Alert severity="info">{t.noUploadedPhotos}</Alert>
                    )}
                  </Box>
                </Box>
              )}

              {/* Tab 2: Person Data Upload */}
              {currentTab === 1 && (
                <Box>
                  {/* Party Committee Section */}
                  <Box sx={{ mb: 5 }}>
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{
                        position: "sticky",
                        top: "80px",
                        zIndex: 1100,
                        backgroundColor: "background.default",
                        py: 2,
                        mb: 2,
                        borderRadius: 1,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 600, flexGrow: 1 }}
                      >
                        {t.partyCommittee}
                      </Typography>
                      {partyPersons.length > 0 && (
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<CloudUploadIcon />}
                          onClick={() => handleSaveCommitteeData("party")}
                          disabled={loading}
                        >
                          {loading ? "Saving..." : "Save Data"}
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleAddPerson("party")}
                      >
                        {t.addRow}
                      </Button>
                    </Stack>

                    {/* Party Committee Table */}
                    {partyPersons.length > 0 ? (
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ minWidth: 80 }}>
                                {t.serialNo}
                              </TableCell>
                              <TableCell sx={{ minWidth: 200 }}>
                                {t.personName}
                              </TableCell>
                              <TableCell sx={{ minWidth: 180 }}>
                                {t.voterId}
                              </TableCell>
                              <TableCell sx={{ minWidth: 150 }}>
                                {t.photo}
                              </TableCell>
                              <TableCell sx={{ minWidth: 200 }}>
                                {t.documents}
                              </TableCell>
                              <TableCell sx={{ minWidth: 100 }}>
                                {t.actions}
                              </TableCell>
                              <TableCell sx={{ minWidth: 150 }}>
                                {t.createdAt}
                              </TableCell>
                              <TableCell sx={{ minWidth: 150 }}>
                                {t.updatedAt}
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {partyPersons.map((person) => (
                              <TableRow key={person.serialNo}>
                                <TableCell>{person.serialNo}</TableCell>
                                <TableCell>
                                  <TextField
                                    size="small"
                                    value={person.name}
                                    onChange={(e) =>
                                      handlePersonFieldChange(
                                        "party",
                                        person.serialNo,
                                        "name",
                                        e.target.value
                                      )
                                    }
                                    placeholder={t.personName}
                                  />
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    size="small"
                                    value={person.voterId}
                                    onChange={(e) =>
                                      handlePersonFieldChange(
                                        "party",
                                        person.serialNo,
                                        "voterId",
                                        e.target.value
                                      )
                                    }
                                    placeholder={t.voterId}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Stack spacing={1} alignItems="center">
                                    {person.photoPreview ? (
                                      <Box sx={{ position: "relative" }}>
                                        <Avatar
                                          src={person.photoPreview}
                                          sx={{
                                            width: 60,
                                            height: 60,
                                            cursor: "pointer",
                                            "&:hover": { opacity: 0.8 },
                                          }}
                                          onClick={() =>
                                            handlePreviewPhoto(
                                              person.photoPreview,
                                              person.name
                                            )
                                          }
                                        />
                                        <IconButton
                                          size="small"
                                          color="error"
                                          sx={{
                                            position: "absolute",
                                            top: -8,
                                            right: -8,
                                            bgcolor: "white",
                                            "&:hover": {
                                              bgcolor: "error.light",
                                            },
                                          }}
                                          onClick={() =>
                                            handleRemovePersonPhoto(
                                              "party",
                                              person.serialNo
                                            )
                                          }
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    ) : (
                                      <>
                                        <input
                                          accept="image/*"
                                          style={{ display: "none" }}
                                          id={`party-photo-${person.serialNo}`}
                                          type="file"
                                          onChange={(e) =>
                                            handlePersonPhotoUpload(
                                              "party",
                                              person.serialNo,
                                              e
                                            )
                                          }
                                        />
                                        <label
                                          htmlFor={`party-photo-${person.serialNo}`}
                                        >
                                          <Button
                                            component="span"
                                            size="small"
                                            variant="outlined"
                                            startIcon={<PersonIcon />}
                                          >
                                            {t.uploadPhoto}
                                          </Button>
                                        </label>
                                      </>
                                    )}
                                  </Stack>
                                </TableCell>
                                <TableCell>
                                  <Stack spacing={1}>
                                    <input
                                      accept="image/*,.pdf"
                                      style={{ display: "none" }}
                                      id={`party-docs-${person.serialNo}`}
                                      type="file"
                                      multiple
                                      onChange={(e) =>
                                        handlePersonDocumentUpload(
                                          "party",
                                          person.serialNo,
                                          e
                                        )
                                      }
                                    />
                                    <label
                                      htmlFor={`party-docs-${person.serialNo}`}
                                    >
                                      <Button
                                        component="span"
                                        size="small"
                                        variant="outlined"
                                        startIcon={<DescriptionIcon />}
                                      >
                                        {t.uploadDocument}
                                      </Button>
                                    </label>
                                    {person.documents.length > 0 && (
                                      <Box sx={{ mt: 1 }}>
                                        {person.documents.map(
                                          (doc, docIndex) => (
                                            <Chip
                                              key={docIndex}
                                              size="small"
                                              label={doc.name}
                                              onClick={() =>
                                                handlePreviewDocument(doc)
                                              }
                                              onDelete={() =>
                                                handleRemoveDocument(
                                                  "party",
                                                  person.serialNo,
                                                  docIndex
                                                )
                                              }
                                              sx={{
                                                mb: 0.5,
                                                mr: 0.5,
                                                cursor: "pointer",
                                                "&:hover": { opacity: 0.8 },
                                              }}
                                              color={
                                                doc.type === "application/pdf"
                                                  ? "secondary"
                                                  : "primary"
                                              }
                                              icon={<DescriptionIcon />}
                                            />
                                          )
                                        )}
                                      </Box>
                                    )}
                                  </Stack>
                                </TableCell>
                                <TableCell>
                                  {!person.isDefault && (
                                    <IconButton
                                      color="error"
                                      onClick={() =>
                                        handleRemovePerson(
                                          "party",
                                          person.serialNo
                                        )
                                      }
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {person.createdAt && (
                                    <Typography
                                      variant="caption"
                                      display="block"
                                    >
                                      {new Date(
                                        person.createdAt.toDate?.() ||
                                          person.createdAt
                                      ).toLocaleString([], {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {person.updatedAt && (
                                    <Typography
                                      variant="caption"
                                      display="block"
                                    >
                                      {new Date(
                                        person.updatedAt.toDate?.() ||
                                          person.updatedAt
                                      ).toLocaleString([], {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </Typography>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Alert severity="info">{t.noPersonsAdded}</Alert>
                    )}
                  </Box>

                  {/* Affiliated Committees Section */}
                  <Box sx={{ mb: 5 }}>
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{
                        position: "sticky",
                        top: "80px",
                        zIndex: 1100,
                        backgroundColor: "background.default",
                        py: 2,
                        mb: 2,
                        borderRadius: 1,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 600, flexGrow: 1 }}
                      >
                        {t.affiliatedCommittees}
                      </Typography>
                      {affiliatedPersons.length > 0 && (
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<CloudUploadIcon />}
                          onClick={() => handleSaveCommitteeData("affiliated")}
                          disabled={loading}
                        >
                          {loading ? "Saving..." : "Save Data"}
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleAddPerson("affiliated")}
                      >
                        {t.addRow}
                      </Button>
                    </Stack>

                    {/* Affiliated Committees Table */}
                    {affiliatedPersons.length > 0 ? (
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ minWidth: 80 }}>
                                {t.serialNo}
                              </TableCell>
                              <TableCell sx={{ minWidth: 200 }}>
                                {t.personName}
                              </TableCell>
                              <TableCell sx={{ minWidth: 180 }}>
                                {t.voterId}
                              </TableCell>
                              <TableCell sx={{ minWidth: 150 }}>
                                {t.photo}
                              </TableCell>
                              <TableCell sx={{ minWidth: 200 }}>
                                {t.documents}
                              </TableCell>
                              <TableCell sx={{ minWidth: 100 }}>
                                {t.actions}
                              </TableCell>
                              <TableCell sx={{ minWidth: 150 }}>
                                {t.createdAt}
                              </TableCell>
                              <TableCell sx={{ minWidth: 150 }}>
                                {t.updatedAt}
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {affiliatedPersons.map((person) => (
                              <TableRow key={person.serialNo}>
                                <TableCell>{person.serialNo}</TableCell>
                                <TableCell>
                                  <TextField
                                    size="small"
                                    value={person.name}
                                    onChange={(e) =>
                                      handlePersonFieldChange(
                                        "affiliated",
                                        person.serialNo,
                                        "name",
                                        e.target.value
                                      )
                                    }
                                    placeholder={t.personName}
                                  />
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    size="small"
                                    value={person.voterId}
                                    onChange={(e) =>
                                      handlePersonFieldChange(
                                        "affiliated",
                                        person.serialNo,
                                        "voterId",
                                        e.target.value
                                      )
                                    }
                                    placeholder={t.voterId}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Stack spacing={1} alignItems="center">
                                    {person.photoPreview ? (
                                      <Box sx={{ position: "relative" }}>
                                        <Avatar
                                          src={person.photoPreview}
                                          sx={{
                                            width: 60,
                                            height: 60,
                                            cursor: "pointer",
                                            "&:hover": { opacity: 0.8 },
                                          }}
                                          onClick={() =>
                                            handlePreviewPhoto(
                                              person.photoPreview,
                                              person.name
                                            )
                                          }
                                        />
                                        <IconButton
                                          size="small"
                                          color="error"
                                          sx={{
                                            position: "absolute",
                                            top: -8,
                                            right: -8,
                                            bgcolor: "white",
                                            "&:hover": {
                                              bgcolor: "error.light",
                                            },
                                          }}
                                          onClick={() =>
                                            handleRemovePersonPhoto(
                                              "affiliated",
                                              person.serialNo
                                            )
                                          }
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    ) : (
                                      <>
                                        <input
                                          accept="image/*"
                                          style={{ display: "none" }}
                                          id={`affiliated-photo-${person.serialNo}`}
                                          type="file"
                                          onChange={(e) =>
                                            handlePersonPhotoUpload(
                                              "affiliated",
                                              person.serialNo,
                                              e
                                            )
                                          }
                                        />
                                        <label
                                          htmlFor={`affiliated-photo-${person.serialNo}`}
                                        >
                                          <Button
                                            component="span"
                                            size="small"
                                            variant="outlined"
                                            startIcon={<PersonIcon />}
                                          >
                                            {t.uploadPhoto}
                                          </Button>
                                        </label>
                                      </>
                                    )}
                                  </Stack>
                                </TableCell>
                                <TableCell>
                                  <Stack spacing={1}>
                                    <input
                                      accept="image/*,.pdf"
                                      style={{ display: "none" }}
                                      id={`affiliated-docs-${person.serialNo}`}
                                      type="file"
                                      multiple
                                      onChange={(e) =>
                                        handlePersonDocumentUpload(
                                          "affiliated",
                                          person.serialNo,
                                          e
                                        )
                                      }
                                    />
                                    <label
                                      htmlFor={`affiliated-docs-${person.serialNo}`}
                                    >
                                      <Button
                                        component="span"
                                        size="small"
                                        variant="outlined"
                                        startIcon={<DescriptionIcon />}
                                      >
                                        {t.uploadDocument}
                                      </Button>
                                    </label>
                                    {person.documents.length > 0 && (
                                      <Box sx={{ mt: 1 }}>
                                        {person.documents.map(
                                          (doc, docIndex) => (
                                            <Chip
                                              key={docIndex}
                                              size="small"
                                              label={doc.name}
                                              onClick={() =>
                                                handlePreviewDocument(doc)
                                              }
                                              onDelete={() =>
                                                handleRemoveDocument(
                                                  "affiliated",
                                                  person.serialNo,
                                                  docIndex
                                                )
                                              }
                                              sx={{
                                                mb: 0.5,
                                                mr: 0.5,
                                                cursor: "pointer",
                                                "&:hover": { opacity: 0.8 },
                                              }}
                                              color={
                                                doc.type === "application/pdf"
                                                  ? "secondary"
                                                  : "primary"
                                              }
                                              icon={<DescriptionIcon />}
                                            />
                                          )
                                        )}
                                      </Box>
                                    )}
                                  </Stack>
                                </TableCell>
                                <TableCell>
                                  {!person.isDefault && (
                                    <IconButton
                                      color="error"
                                      onClick={() =>
                                        handleRemovePerson(
                                          "affiliated",
                                          person.serialNo
                                        )
                                      }
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {person.createdAt && (
                                    <Typography
                                      variant="caption"
                                      display="block"
                                    >
                                      {new Date(
                                        person.createdAt.toDate?.() ||
                                          person.createdAt
                                      ).toLocaleString([], {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {person.updatedAt && (
                                    <Typography
                                      variant="caption"
                                      display="block"
                                    >
                                      {new Date(
                                        person.updatedAt.toDate?.() ||
                                          person.updatedAt
                                      ).toLocaleString([], {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </Typography>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Alert severity="info">{t.noPersonsAdded}</Alert>
                    )}
                  </Box>
                </Box>
              )}
            </>
          )}
        </>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={previewDialog.open}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {previewDialog.name}
          <IconButton
            aria-label="close"
            onClick={handleClosePreview}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {previewDialog.type === "image" ? (
            <Box
              component="img"
              src={previewDialog.url}
              alt={previewDialog.name}
              sx={{
                width: "100%",
                height: "auto",
                maxHeight: "70vh",
                objectFit: "contain",
              }}
            />
          ) : previewDialog.type === "pdf" ? (
            <Box sx={{ width: "100%", height: "70vh" }}>
              <iframe
                src={previewDialog.url}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                title={previewDialog.name}
              />
            </Box>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          {t.deleteConfirmTitle}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            {deleteDialog.type === "person" && t.deletePersonMessage}
            {deleteDialog.type === "photo" && t.deletePhotoMessage}
            {deleteDialog.type === "document" && t.deleteDocumentMessage}
            {deleteDialog.type === "uploaded-photo" && t.deletePhotoMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            {t.cancel}
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            autoFocus
          >
            {t.delete}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
