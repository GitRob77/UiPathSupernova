"use client";

import { useState } from "react";
import { ListingLayout } from "@/components/layouts/listing-layout";
import type { OntologyView } from "../data/types";
import { objectTypes, linkTypes, actionTypes } from "../data/mock-data";
import { OntologySidebar } from "../components/ontology-sidebar";
import { DiscoverView } from "../components/discover-view";
import { ObjectTypesListing } from "../components/object-types-listing";
import { ObjectTypeDetail } from "../components/object-type-detail";
import { OntologyGraphView } from "../components/ontology-graph-view";
import { LinkTypesListing } from "../components/link-types-listing";
import { ActionTypesListing } from "../components/action-types-listing";
import { SharedPropertiesListing } from "../components/shared-properties-listing";

export default function ObjectOntologyHomePage() {
  const [activeView, setActiveView] = useState<OntologyView>("discover");
  const [selectedObjectTypeId, setSelectedObjectTypeId] = useState<string | null>(null);

  const selectedObjectType = selectedObjectTypeId
    ? objectTypes.find((ot) => ot.id === selectedObjectTypeId) ?? null
    : null;

  function handleViewChange(view: OntologyView) {
    setActiveView(view);
    setSelectedObjectTypeId(null);
  }

  function handleSelectObjectType(id: string) {
    setActiveView("object-types");
    setSelectedObjectTypeId(id);
  }

  return (
    <ListingLayout
      productName="Ontology Manager"
      leftSidebar={{
        collapsible: true,
        resizable: true,
        content: ({ collapsed, side }) => (
          <OntologySidebar
            activeView={activeView}
            collapsed={collapsed}
            side={side}
            onViewChange={handleViewChange}
          />
        ),
      }}
    >
      {activeView === "discover" && (
        <DiscoverView
          onNavigate={handleViewChange}
          onSelectObjectType={handleSelectObjectType}
        />
      )}

      {activeView === "object-types" && !selectedObjectType && (
        <ObjectTypesListing onSelectObjectType={handleSelectObjectType} />
      )}

      {activeView === "object-types" && selectedObjectType && (
        <ObjectTypeDetail
          objectType={selectedObjectType}
          allObjectTypes={objectTypes}
          allLinkTypes={linkTypes}
          allActionTypes={actionTypes}
          onBack={() => setSelectedObjectTypeId(null)}
        />
      )}

      {activeView === "graph" && (
        <OntologyGraphView onSelectObjectType={handleSelectObjectType} />
      )}

      {activeView === "link-types" && <LinkTypesListing />}

      {activeView === "action-types" && <ActionTypesListing />}

      {activeView === "shared-properties" && <SharedPropertiesListing />}
    </ListingLayout>
  );
}
