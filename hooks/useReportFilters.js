"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function useReportFilters() {
  // Filter states
  const [stands, setStands] = useState([]);
  const [selectedStand, setSelectedStand] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [productType, setProductType] = useState("");
  const [productName, setProductName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [revisionType, setRevisionType] = useState("");

  const searchParams = useSearchParams();
  const router = useRouter();

  // Fetch data functions
  async function fetchStands() {
    if (stands.length > 0) return;
    try {
      const res = await fetch("/api/stands");
      if (!res.ok) throw new Error("error");
      const data = await res.json();
      setStands(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchUsers() {
    if (users.length > 0) return;
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchPartners() {
    if (partners.length > 0) return;
    try {
      const res = await fetch("/api/partners");
      if (!res.ok) throw new Error("Failed to fetch partners");
      const data = await res.json();
      setPartners(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchProducts() {
    if (products.length > 0) return;
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  }

  // Clear function
  function handleClear() {
    router.replace('/dashboard/reports/sale', { shallow: true });
    setSelectedStand([]);
    setSelectedUser([]);
    setDateFrom(null);
    setDateTo(null);
    setSelectedPartner([]);
    setSelectedProducts([]);
    setProductType('');
    setBarcode('');
    setProductName('');
    setRevisionType('');
  }

  // Sync URL params with selected values
  useEffect(() => {
    const standParam = searchParams.get("stand");
    const userParam = searchParams.get("user");
    const dateFromParam = searchParams.get("dateFrom");
    const dateToParam = searchParams.get("dateTo");
    const partnerId = searchParams.get("partnerId");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const barcodeParam = searchParams.get("barcode");
    const revisionTypeParam = searchParams.get("revisionType");
    const productBarcodesParam = searchParams.get("productBarcodes");
    const productNameParam = searchParams.get("productName");

    if (standParam) {
      const standValues = standParam.split(',').filter(v => v.trim() !== '');
      setSelectedStand(standValues);
    } else {
      setSelectedStand([]);
    }

    if (userParam) {
      const userValues = userParam.split(',').filter(v => v.trim() !== '');
      setSelectedUser(userValues);
    } else {
      setSelectedUser([]);
    }

    if (dateFromParam) {
      setDateFrom(new Date(dateFromParam));
    } else {
      setDateFrom(null);
    }

    if (dateToParam) {
      setDateTo(new Date(dateToParam));
    } else {
      setDateTo(null);
    }

    if (partnerId) {
      const partnerValues = partnerId.split(',').filter(v => v.trim() !== '');
      setSelectedPartner(partnerValues);
    } else {
      setSelectedPartner([]);
    }

    if (type) {
      setProductType(type);
    }

    if (barcodeParam) {
      setBarcode(barcodeParam);
    }

    if (revisionTypeParam) {
      setRevisionType(revisionTypeParam);
    }

    if (productBarcodesParam) {
      const productBarcodeValues = productBarcodesParam.split(',').filter(v => v.trim() !== '');
      setSelectedProducts(productBarcodeValues);
    } else {
      setSelectedProducts([]);
    }

    if (productNameParam) {
      setProductName(productNameParam);
    }
  }, [searchParams]);

  // Fetch data on mount
  useEffect(() => {
    fetchStands();
    fetchUsers();
    fetchPartners();
    fetchProducts();
  }, []);

  return {
    // Data
    stands,
    users,
    partners,
    products,
    
    // Filter states
    selectedStand,
    setSelectedStand,
    selectedUser,
    setSelectedUser,
    selectedPartner,
    setSelectedPartner,
    selectedProducts,
    setSelectedProducts,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    productType,
    setProductType,
    productName,
    setProductName,
    barcode,
    setBarcode,
    revisionType,
    setRevisionType,
    
    // Actions
    handleClear,
  };
} 