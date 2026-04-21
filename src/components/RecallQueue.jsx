import React from 'react';
import { Trophy, RotateCcw } from 'lucide-react';

/**
 * Renders a single card in the recall queue.
 */
const RecallQueueCard = ({ snippet, isActive, onClick }) => {
  const dateStr = snippet.createdAtReadable ? snippet.createdAtReadable.split(" ")[0] : "New";

  return (
    <div
      className={`recall-queue-card ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      <div className="recall-card-header">
        <span className="recall-card-topic">{snippet.topic || "No Topic"}</span>
        <span className="recall-card-date">{dateStr}</span>
      </div>
      <h4 className="recall-card-title">{snippet.title || "Untitled Snippet"}</h4>

      <div className="recall-card-footer">
        {snippet.recallStreak > 0 && (
          <span className="recall-streak-badge">
            <Trophy size={12} /> {snippet.recallStreak}
          </span>
        )}
        {snippet.lastFeedback === "revisit" && (
          <span className="recall-status-revisit">
            <RotateCcw size={12} /> Revisit
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Sidebar-style queue for the Recall Mode.
 */
const RecallQueue = ({ queue, selectedId, onSelect }) => {
  return (
    <div className="recall-queue-panel">
      <div className="panel-header">
        <h3>Recall Queue</h3>
        <span className="queue-count">{queue.length}</span>
      </div>
      <div className="queue-list">
        {queue.map(item => (
          <RecallQueueCard
            key={item.id}
            snippet={item}
            isActive={item.id === selectedId}
            onClick={() => onSelect(item.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default RecallQueue;
export { RecallQueueCard };
