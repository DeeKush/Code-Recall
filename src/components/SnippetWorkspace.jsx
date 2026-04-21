import React from 'react';
import SnippetList from "./SnippetList";
import SnippetDetail from "./SnippetDetail";

/**
 * Decomposed component for the main snippet management workspace.
 * Handles the layout and logic for viewing the list and detail side-by-side.
 */
const SnippetWorkspace = ({
  snippets,
  filteredSnippets,
  selectedSnippet,
  loading,
  notesStatus,
  showMobileDetail,
  filterDate,
  onSelect,
  onRetryNotes,
  onUpdate,
  onDelete,
  onBackToMobileList
}) => {
  return (
    <main className="dashboard-content">
      {/* Left pane - Snippet list */}
      <section className={`pane pane-list ${showMobileDetail ? 'mobile-hidden' : ''}`}>
        <div className="pane-header">
          <h2>Your Snippets</h2>
          <span className="snippet-count">{filteredSnippets.length}</span>
        </div>
        
        {filterDate && (
          <p className="filter-hint-dark">Filtering: {filterDate}</p>
        )}

        <SnippetList
          snippets={filteredSnippets}
          selectedId={selectedSnippet?.id}
          onSelect={onSelect}
          loading={loading}
        />
      </section>

      {/* Right pane - Snippet detail */}
      <section className={`pane pane-detail ${showMobileDetail ? 'mobile-visible' : ''}`}>
        <SnippetDetail
          snippet={selectedSnippet}
          notesStatus={selectedSnippet ? (notesStatus[selectedSnippet.id] || "idle") : "idle"}
          onRetryNotes={onRetryNotes}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onBack={onBackToMobileList}
        />
      </section>
    </main>
  );
};

export default SnippetWorkspace;
