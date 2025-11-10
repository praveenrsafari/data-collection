// Hierarchical location data for Constituency -> Mandal -> Panchayat
export const locationData = {
  Pileru: {
    Pileru: [
      "AGRAHARAM",
      "BALAMVARIPALLE",
      "BODUMALLUVARIPALLE",
      "DODDIPALLE",
      "GUDAREVUPALLE",
      "JANDLA",
      "KAKULARAMPALLE",
      "KAVALIPALLE",
      "MELLACHERUVU",
      "MUDUPULAVEMULA",
      "PILER",
      "REGALLU",
      "TALUPULA",
      "VEPULABYLU",
      "YERRAGUNTLAPALLE",
    ],
    Gurramkonda: [
      "AMILEPALLE",
      "CHERLOPALLE",
      "GURRAMKONDA",
      "KHANDRIGA",
      "MARRIMAKULAPALLE",
      "MARRIPADU",
      "NADIMIKANDRIGA",
      "RAMAPURAM",
      "SANGASAMUDRAM",
      "SARIMADUGU",
      "SETLIVARIPALLE",
      "THARIGONDA",
      "THARIGONDARACHAPALLE",
      "T.PASALAVANDLAPALLE",
      "YELLUTLA",
    ],
    Valmikipuram: [
      "AYYAVARIPALLE",
      "BUDIDAVEDU",
      "CHINTAPARTHI",
      "CHINTHALAVARIPALLE",
      "GANDABOYANAPALLE",
      "JARRAVARIPALLE",
      "KURAPARTHI",
      "MADHAVARAM PALLE",
      "MANCHURU",
      "MUGALAMARRI",
      "MUREVENDLA PALLE",
      "NAGARIMADUGU",
      "THATIGUNTAPALLE",
      "T.SAKIREVUPALLE",
      "VALMIKIPURAM",
      "VITTALAM",
    ],
    Kalikiri: [
      "ADDAVARI PALLE",
      "CHEEKATIPALLE",
      "GUNDLORU",
      "GUTTAPALEM",
      "KALIKIRI",
      "MAHAL",
      "MARRIKUNTAPALLE",
      "MEDIKURTHI",
      "MORAMKINDA PALLE",
      "MUNELLAPALLE",
      "PALLAVOLU",
      "PARAPATLA",
      "PATHEGADA",
      "TSANDRAVARIPALLE",
    ],
    Kalakada: [
      "BALAIAHGARIPALLE",
      "BATAVARIPALLE",
      "DEVALAPALLE",
      "DIGUVA THANDA",
      "GANGAPURAM",
      "GUDIBANDA",
      "KADIRAYACHERUVU",
      "KALAKADA",
      "KALAKADADODDIPALLE",
      "KONA",
      "MUDIAMVARIPALLE",
      "NADIMICHERLA",
      "NAWABPET",
      "RATHIGUNTAPALLE",
      "YENUGONDAPALEM",
      "YERRAKOTAPALLE",
    ],
    Kambhamvaripalle: [
      "GALIVARIPALLI",
      "GARNIMITTA",
      "GORANTLAPALLE",
      "GYARAMPALLE",
      "JILLELLAMANDA",
      "KAMBHAMVARIPALLE",
      "KOTHA PALLI",
      "MADDIPATLAVANDLAPALLE",
      "MAHALRAJUPALLE",
      "MARELLA",
      "MATAMPALLE",
      "MUTTUPALLIVANDLAPALLI",
      "NOOTHANAKALVA",
      "SORAKAYALAPETA",
      "SUGALI THANDA",
      "THEETHAVAGUNTAPALLE",
      "THIMMAPURAM",
      "THUVVAPALLE",
      "VAGALLA",
    ],
  },
};

// Get all constituencies
export const getConstituencies = () => {
  return Object.keys(locationData);
};

// Get mandals for a constituency
export const getMandalsForConstituency = (constituency) => {
  if (!constituency || !locationData[constituency]) return [];
  return Object.keys(locationData[constituency]);
};

// Get panchayats for a mandal
export const getPanchayatsForMandal = (constituency, mandal) => {
  if (!constituency || !mandal || !locationData[constituency]?.[mandal])
    return [];
  return locationData[constituency][mandal];
};
