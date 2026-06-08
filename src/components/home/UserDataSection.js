import { useState } from 'react';
import { useI18n } from '../../i18n/i18n';
import WorkMonthTable from '../WorkMonthTable';
import './UserDataSection.css';

function ChevronIcon({ expanded }) {
  return (
    <svg
      className={`table-toggle-icon${expanded ? '' : ' table-toggle-icon--collapsed'}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"
      />
    </svg>
  );
}

function UserDataSection({ userMonthBlocks }) {
  const { t } = useI18n();
  const [tablesExpanded, setTablesExpanded] = useState(true);

  return (
    <div className="table-area">
      <div className="table-toolbar">
        <button
          type="button"
          className="table-toggle-btn"
          onClick={() => setTablesExpanded((prev) => !prev)}
          aria-expanded={tablesExpanded}
          aria-label={tablesExpanded ? t('collapseTables') : t('expandTables')}
        >
          <ChevronIcon expanded={tablesExpanded} />
        </button>
      </div>
      <div className={`table-collapse ${tablesExpanded ? 'table-collapse--open' : 'table-collapse--closed'}`}>
        <div className="table-collapse-inner">
          <WorkMonthTable blocks={userMonthBlocks} />
        </div>
      </div>
    </div>
  );
}

export default UserDataSection;
