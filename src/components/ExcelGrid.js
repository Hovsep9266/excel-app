import './ExcelGrid.css';
import { useI18n } from '../i18n/i18n';

function ExcelGrid({ rows }) {
  const { t } = useI18n();
  if (!rows.length) {
    return (
      <div className="table-wrap">
        <p className="empty-text">{t('emptyRows')}</p>
      </div>
    );
  }

  const columnCount = rows.reduce((max, row) => Math.max(max, row.length), 0);
  const toExcelColumnLabel = (index) => {
    let label = '';
    let current = index + 1;
    while (current > 0) {
      const remainder = (current - 1) % 26;
      label = String.fromCharCode(65 + remainder) + label;
      current = Math.floor((current - 1) / 26);
    }
    return label;
  };


  return (
    <div className="table-wrap">
      <table className="excel-grid excel-grid-desktop">
        <thead>
          <tr>
            <th className="corner-cell" />
            {Array.from({ length: columnCount }).map((_, index) => (
              <th key={`h-${index}`}>{toExcelColumnLabel(index)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`r-${rowIndex}`}>
              <td className="row-index-cell">{rowIndex + 1}</td>
              {Array.from({ length: columnCount }).map((_, cellIndex) => (
                <td key={`c-${rowIndex}-${cellIndex}`}>{String(row[cellIndex] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <table className="excel-grid excel-grid-mobile-view">
        <thead>
          <tr>
            <th>{t('colHeader')}</th>
            {rows.map((_, rowIndex) => (
              <th key={`mrh-${rowIndex}`}>{rowIndex + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: columnCount }).map((_, columnIndex) => (
            <tr key={`mrr-${columnIndex}`}>
              <th>{toExcelColumnLabel(columnIndex)}</th>
              {rows.map((row, rowIndex) => (
                <td key={`mrc-${columnIndex}-${rowIndex}`}>{String(row[columnIndex] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExcelGrid;
