export const apSeed = {
  constituencies: [
    { id: "ap-c-1", name: "Srikakulam", district: "Srikakulam" },
    { id: "ap-c-2", name: "Visakhapatnam North", district: "Visakhapatnam" },
    { id: "ap-c-3", name: "Vijayawada Central", district: "Krishna" },
  ],
  mandals: [
    { id: "ap-m-1", name: "Amadalavalasa", constituencyId: "ap-c-1" },
    { id: "ap-m-2", name: "Palasa", constituencyId: "ap-c-1" },
    { id: "ap-m-3", name: "Bheemunipatnam", constituencyId: "ap-c-2" },
    { id: "ap-m-4", name: "Madhurawada", constituencyId: "ap-c-2" },
    { id: "ap-m-5", name: "Vijayawada Urban", constituencyId: "ap-c-3" },
  ],
  panchayats: [
    { id: "ap-p-1", name: "Kondagandi", mandalId: "ap-m-1" },
    { id: "ap-p-2", name: "Metturu", mandalId: "ap-m-1" },
    { id: "ap-p-3", name: "Gollaprolu", mandalId: "ap-m-2" },
    { id: "ap-p-4", name: "Kapuluppada", mandalId: "ap-m-3" },
    { id: "ap-p-5", name: "Rushikonda", mandalId: "ap-m-4" },
    { id: "ap-p-6", name: "Suryaraopeta", mandalId: "ap-m-5" },
  ],
};
