"use client";

import DateRangeFilter from "./DateRangeFilter";
import ProductFilter from "./ProductFilter";
import TypeFilter from "./TypeFilter";
import EntityFilter from "./EntityFilter";
import FilterButtons from "./FilterButtons";

export default function ReportFilters({
  // Date filters
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  
  // Product filters
  products,
  selectedProducts,
  setSelectedProducts,
  productName,
  setProductName,
  
  // Type filters
  productType,
  setProductType,
  revisionType,
  setRevisionType,
  
  // Entity filters
  stands,
  selectedStand,
  setSelectedStand,
  users,
  selectedUser,
  setSelectedUser,
  partners,
  selectedPartner,
  setSelectedPartner,
  
  // Actions
  onSubmit,
  onClear,
  
  // Optional: hide specific filter sections
  hideDateFilter = false,
  hideProductFilter = false,
  hideTypeFilter = false,
  hideEntityFilter = false,
  // Entity filter specific hiding
  hidePartners = false,
  hideStands = false,
  hideUsers = false,
}) {
  return (
    <form className="flex flex-col gap-4 w-full" onSubmit={onSubmit}>
      {/* Дата */}
      {!hideDateFilter && (
        <DateRangeFilter
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
        />
      )}

      {/* Продукт */}
      {!hideProductFilter && (
        <ProductFilter
          products={products}
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
          productName={productName}
          setProductName={setProductName}
        />
      )}

      {/* Тип */}
      {!hideTypeFilter && (
        <TypeFilter
          productType={productType}
          setProductType={setProductType}
          revisionType={revisionType}
          setRevisionType={setRevisionType}
        />
      )}

      {/* Партньор, Щендер, Потребител */}
      {!hideEntityFilter && (
        <EntityFilter
          stands={stands}
          selectedStand={selectedStand}
          setSelectedStand={setSelectedStand}
          users={users}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          partners={partners}
          selectedPartner={selectedPartner}
          setSelectedPartner={setSelectedPartner}
          hidePartners={hidePartners}
          hideStands={hideStands}
          hideUsers={hideUsers}
        />
      )}

      <FilterButtons onSubmit={onSubmit} onClear={onClear} />
    </form>
  );
} 